use anyhow::{Context, Result};
use sqlx::postgres::PgPoolOptions;
use sqlx::{PgPool, Pool, Postgres};
use std::path::Path;
use tracing::{info, warn};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MigrationDirection {
    Up,
    Down,
}

pub struct MigrationRunner {
    pool: Pool<Postgres>,
    migrations_dir: String,
}

impl MigrationRunner {
    /// Create a new migration runner
    pub fn new(pool: Pool<Postgres>, migrations_dir: String) -> Self {
        Self {
            pool,
            migrations_dir,
        }
    }

    /// Create a migration runner from environment variables
    pub async fn from_env(migrations_dir: String) -> Result<Self> {
        let database_url = std::env::var("DATABASE_URL")
            .context("DATABASE_URL environment variable must be set")?;

        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await
            .context("Failed to connect to database")?;

        Ok(Self::new(pool, migrations_dir))
    }

    /// Run migrations in the specified direction
    pub async fn run(&self, direction: MigrationDirection) -> Result<()> {
        info!("Running migrations: {:?}", direction);

        match direction {
            MigrationDirection::Up => self.run_up().await,
            MigrationDirection::Down => self.run_down().await,
        }
    }

    /// Run all pending migrations (up)
    async fn run_up(&self) -> Result<()> {
        // Ensure the migrations table exists
        self.create_migrations_table().await?;

        // Get list of migration files
        let migration_files = self.get_migration_files()?;
        
        // Get already applied migrations
        let applied_migrations = self.get_applied_migrations().await?;

        // Filter out already applied migrations
        let pending_migrations: Vec<_> = migration_files
            .into_iter()
            .filter(|(version, _)| !applied_migrations.contains(version))
            .collect();

        if pending_migrations.is_empty() {
            info!("No pending migrations to apply");
            return Ok(());
        }

        info!("Found {} pending migrations", pending_migrations.len());

        // Apply migrations in order
        for (version, path) in pending_migrations {
            info!("Applying migration: {}", version);
            self.apply_migration(&version, &path).await?;
            info!("Successfully applied migration: {}", version);
        }

        info!("All migrations applied successfully");
        Ok(())
    }

    /// Rollback the last migration (down)
    async fn run_down(&self) -> Result<()> {
        // Ensure the migrations table exists
        self.create_migrations_table().await?;

        // Get the last applied migration
        let last_migration = self.get_last_applied_migration().await?;

        match last_migration {
            Some(version) => {
                info!("Rolling back migration: {}", version);
                
                // Look for a down migration file
                let down_file = self.find_down_migration(&version)?;
                
                match down_file {
                    Some(path) => {
                        self.rollback_migration(&version, &path).await?;
                        info!("Successfully rolled back migration: {}", version);
                    }
                    None => {
                        warn!("No down migration found for {}, skipping", version);
                        warn!("To support rollback, create a corresponding down migration file");
                    }
                }
                
                Ok(())
            }
            None => {
                info!("No migrations to rollback");
                Ok(())
            }
        }
    }

    /// Create the migrations tracking table if it doesn't exist
    async fn create_migrations_table(&self) -> Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS _schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .context("Failed to create migrations table")?;

        Ok(())
    }

    /// Get all migration files sorted by version
    fn get_migration_files(&self) -> Result<Vec<(String, String)>> {
        let migrations_path = Path::new(&self.migrations_dir);
        
        if !migrations_path.exists() {
            return Err(anyhow::anyhow!(
                "Migrations directory does not exist: {}",
                self.migrations_dir
            ));
        }

        let mut migrations: Vec<(String, String)> = Vec::new();

        for entry in std::fs::read_dir(migrations_path)
            .context("Failed to read migrations directory")?
        {
            let entry = entry.context("Failed to read directory entry")?;
            let path = entry.path();
            
            if path.extension().and_then(|s| s.to_str()) == Some("sql") {
                let filename = path
                    .file_stem()
                    .and_then(|s| s.to_str())
                    .unwrap_or("");
                
                // Skip down migrations (they end with _down)
                if !filename.ends_with("_down") {
                    let version = filename.to_string();
                    let full_path = path
                        .to_str()
                        .ok_or_else(|| anyhow::anyhow!("Invalid path"))?
                        .to_string();
                    
                    migrations.push((version, full_path));
                }
            }
        }

        // Sort by version (filename includes timestamp)
        migrations.sort_by(|a, b| a.0.cmp(&b.0));

        Ok(migrations)
    }

    /// Get list of already applied migrations
    async fn get_applied_migrations(&self) -> Result<Vec<String>> {
        let rows = sqlx::query_as::<_, (String,)>(
            "SELECT version FROM _schema_migrations ORDER BY version"
        )
        .fetch_all(&self.pool)
        .await
        .context("Failed to fetch applied migrations")?;

        Ok(rows.into_iter().map(|(version,)| version).collect())
    }

    /// Get the last applied migration
    async fn get_last_applied_migration(&self) -> Result<Option<String>> {
        let row = sqlx::query_as::<_, (String,)>(
            "SELECT version FROM _schema_migrations ORDER BY version DESC LIMIT 1"
        )
        .fetch_optional(&self.pool)
        .await
        .context("Failed to fetch last applied migration")?;

        Ok(row.map(|(version,)| version))
    }

    /// Apply a single migration
    async fn apply_migration(&self, version: &str, path: &str) -> Result<()> {
        // Read the migration SQL
        let sql = std::fs::read_to_string(path)
            .context(format!("Failed to read migration file: {}", path))?;

        // Execute the migration in a transaction
        let mut tx = self.pool.begin().await?;

        sqlx::query(&sql)
            .execute(&mut *tx)
            .await
            .context(format!("Failed to execute migration: {}", version))?;

        // Record the migration
        sqlx::query(
            "INSERT INTO _schema_migrations (version) VALUES ($1)"
        )
        .bind(version)
        .execute(&mut *tx)
        .await
        .context("Failed to record migration")?;

        tx.commit().await?;

        Ok(())
    }

    /// Find the corresponding down migration file
    fn find_down_migration(&self, version: &str) -> Result<Option<String>> {
        let migrations_path = Path::new(&self.migrations_dir);
        let down_filename = format!("{}_down.sql", version);
        let down_path = migrations_path.join(&down_filename);

        if down_path.exists() {
            Ok(Some(
                down_path
                    .to_str()
                    .ok_or_else(|| anyhow::anyhow!("Invalid path"))?
                    .to_string(),
            ))
        } else {
            Ok(None)
        }
    }

    /// Rollback a single migration
    async fn rollback_migration(&self, version: &str, path: &str) -> Result<()> {
        // Read the down migration SQL
        let sql = std::fs::read_to_string(path)
            .context(format!("Failed to read down migration file: {}", path))?;

        // Execute the rollback in a transaction
        let mut tx = self.pool.begin().await?;

        sqlx::query(&sql)
            .execute(&mut *tx)
            .await
            .context(format!("Failed to execute rollback: {}", version))?;

        // Remove the migration record
        sqlx::query(
            "DELETE FROM _schema_migrations WHERE version = $1"
        )
        .bind(version)
        .execute(&mut *tx)
        .await
        .context("Failed to remove migration record")?;

        tx.commit().await?;

        Ok(())
    }

    /// Get the current migration status
    pub async fn status(&self) -> Result<MigrationStatus> {
        self.create_migrations_table().await?;

        let migration_files = self.get_migration_files()?;
        let applied_migrations = self.get_applied_migrations().await?;

        let pending: Vec<_> = migration_files
            .iter()
            .filter(|(version, _)| !applied_migrations.contains(version))
            .map(|(version, _)| version.clone())
            .collect();

        let applied: Vec<_> = applied_migrations;

        Ok(MigrationStatus {
            applied,
            pending,
        })
    }
}

#[derive(Debug)]
pub struct MigrationStatus {
    pub applied: Vec<String>,
    pub pending: Vec<String>,
}
