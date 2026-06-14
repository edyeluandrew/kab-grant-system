"""
System Settings Seeder
=======================
Seeds initial system settings into the database.

Usage (standalone):
    python seed_settings.py

Or import and call: await seed_settings(db)
"""

import asyncio
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models import SystemSetting


async def seed_settings(db: AsyncSession):
    """Seed system settings if they don't exist."""
    try:
        # Check if settings already exist
        result = await db.execute(select(SystemSetting).limit(1))
        existing_settings = result.scalar_one_or_none()
        
        if existing_settings:
            print("✅ System settings already exist. Skipping seed.")
            return
        
        # Create default system settings
        settings = SystemSetting(
            system_name="KAB Fund for Innovation and Research (KAB-FIR)",
            system_motto="Supporting Innovation and Research at Kabale University",
            address="Kabale University, P.O. Box 317, Kabale, Uganda",
            email="innovation@kab.ac.ug",
            phone="+256-486-430-033",
            active_academic_year=2026,
            submission_deadline=date(2026, 12, 31),
            is_accepting_applications=True,
        )
        
        db.add(settings)
        await db.commit()
        print("✅ System settings seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding settings: {e}")
        await db.rollback()
        raise


async def main():
    """Run seeder standalone."""
    async with AsyncSessionLocal() as db:
        await seed_settings(db)


if __name__ == "__main__":
    asyncio.run(main())
