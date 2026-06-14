
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.models import User, UserRole, Gender
from app.utils.password import hash_password

async def create_admin():
    async with AsyncSessionLocal() as db:
        sgo_admin = User(
            first_name='SGO',
            surname='sgo_admin',
            gender=Gender.male,
            email='sgo@kab.ac.ug',
            password_hash=hash_password('sgo@2026'),
            role=UserRole.sgo_admin,
            is_active=True,
        )
        db.add(sgo_admin)
        await db.commit()
        print('Admin created:', sgo_admin.email)

asyncio.run(create_admin())
