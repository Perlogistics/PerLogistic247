# Database Migration System

This directory contains database migrations for the Supply Chain Protocol backend.

## Overview

The migration system uses a custom Rust-based migration runner built on top of sqlx. It provides:

- **Versioned migrations**: Each migration is timestamped for ordering
- **Up/Down support**: Apply and rollback migrations
- **Tracking table**: Automatically tracks which migrations have been applied
- **CLI tool**: Easy-to-use command-line interface for managing migrations

## Migration File Format

Migration files should be named with the following pattern:

```
{timestamp}_{description}.sql
```

For example: `20240517000001_initial_schema.sql`

The timestamp should be in the format: `YYYYMMDDHHMMSS`

### Down Migrations

To support rollback, create a corresponding down migration file:

```
{timestamp}_{description}_down.sql
```

For example: `20240517000001_initial_schema_down.sql`

The down migration should reverse the changes made in the up migration.

## Usage

### Running Migrations Locally

1. Set the `DATABASE_URL` environment variable:
   ```bash
   export DATABASE_URL=postgres://postgres:postgres@localhost:5432/supply_chain
   ```

2. Run migrations:
   ```bash
   cd backend
   cargo run --bin migrate -- up
   ```

3. Check migration status:
   ```bash
   cargo run --bin migrate -- status
   ```

4. Rollback the last migration:
   ```bash
   cargo run --bin migrate -- down
   ```

### Running with Docker Compose

The migration system is integrated into the Docker Compose setup. Migrations are automatically applied when you start the services:

```bash
docker-compose up
```

The `migrate` service runs before the `backend` service, ensuring the database schema is up-to-date before the API starts.

## Creating a New Migration

1. Create a new migration file in this directory with a timestamp:
   ```bash
   touch 20240517120000_add_new_feature.sql
   ```

2. Write your SQL migration in the file:
   ```sql
   -- Add a new column to the shipments table
   ALTER TABLE shipments ADD COLUMN new_column VARCHAR(255);
   ```

3. (Optional) Create a down migration to support rollback:
   ```bash
   touch 20240517120000_add_new_feature_down.sql
   ```
   ```sql
   -- Remove the new column
   ALTER TABLE shipments DROP COLUMN new_column;
   ```

4. Run the migration:
   ```bash
   cargo run --bin migrate -- up
   ```

## Migration Tracking

The system uses a `_schema_migrations` table to track which migrations have been applied:

```sql
CREATE TABLE _schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

This table is automatically created when you first run the migration CLI.

## Best Practices

- **Always create down migrations**: This allows for easy rollback during development
- **Test migrations**: Test both up and down migrations in a development environment
- **Use transactions**: The migration runner executes each migration in a transaction
- **Keep migrations small**: Break large schema changes into multiple smaller migrations
- **Document changes**: Add comments in your SQL files explaining what the migration does
- **Version control**: Always commit migration files to version control

## Troubleshooting

### Migration Fails

If a migration fails:
1. Check the error message for details
2. Fix the issue in the migration file
3. If the migration was partially applied, you may need to manually fix the database state
4. Re-run the migration

### Rollback Not Available

If you try to rollback but no down migration exists:
- The system will warn you and skip the rollback
- You'll need to manually create a down migration file
- Or manually revert the database changes

### Database Connection Issues

Ensure:
- PostgreSQL is running
- The `DATABASE_URL` is correctly set
- The database user has the necessary permissions

## Current Schema

The initial migration (`20240517000001_initial_schema.sql`) creates:

- **shipments**: Core shipment tracking table
- **events**: Event log for shipment updates
- **zk_attestations**: Zero-knowledge proof attestations
- **payment_agreements**: Payment agreement records
- **payment_executions**: Payment execution records

See the migration file for detailed schema definitions.
