use anyhow::Result;
use clap::{Parser, Subcommand};
use supply_chain_backend::migrations::{MigrationDirection, MigrationRunner};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Parser)]
#[command(name = "migrate")]
#[command(about = "Database migration CLI for Supply Chain Protocol", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Apply all pending migrations
    Up,
    /// Rollback the last migration
    Down,
    /// Show migration status
    Status,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "supply_chain_backend=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cli = Cli::parse();

    // Get migrations directory (default to ./migrations relative to CWD)
    let migrations_dir = std::env::var("MIGRATIONS_DIR")
        .unwrap_or_else(|_| "./migrations".to_string());

    // Create migration runner
    let runner = MigrationRunner::from_env(migrations_dir).await?;

    match cli.command {
        Commands::Up => {
            runner.run(MigrationDirection::Up).await?;
            println!("✅ Migrations applied successfully");
        }
        Commands::Down => {
            runner.run(MigrationDirection::Down).await?;
            println!("✅ Migration rolled back successfully");
        }
        Commands::Status => {
            let status = runner.status().await?;
            
            println!("\n📊 Migration Status\n");
            
            if status.applied.is_empty() {
                println!("No migrations applied yet");
            } else {
                println!("Applied migrations:");
                for migration in &status.applied {
                    println!("  ✓ {}", migration);
                }
            }
            
            println!();
            
            if status.pending.is_empty() {
                println!("No pending migrations");
            } else {
                println!("Pending migrations:");
                for migration in &status.pending {
                    println!("  ○ {}", migration);
                }
            }
            
            println!();
        }
    }

    Ok(())
}
