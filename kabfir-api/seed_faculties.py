

"""
Kabale University — Faculty & Department Seeder
================================================
All data sourced directly from kab.ac.ug (verified May 2026).

Usage (standalone):
    python seed_faculties.py

Or call seed(db) from your app startup / an Alembic data migration.
"""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models import Faculty, Department


# ─────────────────────────────────────────────────────────────────────────────
# KABALE UNIVERSITY — COMPLETE FACULTY & DEPARTMENT STRUCTURE
# ─────────────────────────────────────────────────────────────────────────────

KAB_STRUCTURE = [

    # 1. SCHOOL OF MEDICINE
    {
        "faculty": "Kabale University School of Medicine (KABSOM)",
        "departments": [
            "Department of Anatomy",
            "Department of Physiology",
            "Department of Pathology",
            "Department of Internal Medicine",
            "Department of Surgery",
            "Department of Obstetrics & Gynaecology",
            "Department of Paediatrics & Child Health",
            "Department of Anaesthesia",
            "Department of Orthopedic Surgery",
            "Department of Nursing Science",
            "Department of Environmental Health Science",
        ],
    },

    # 2. AGRICULTURE & ENVIRONMENTAL SCIENCES
    {
        "faculty": "Faculty of Agriculture and Environmental Sciences",
        "departments": [
            "Department of Agricultural Sciences",
            "Department of Environmental Sciences",
        ],
    },

    # 3. ENGINEERING, TECHNOLOGY, APPLIED DESIGN & FINE ART
    {
        "faculty": "Faculty of Engineering, Technology, Applied Design and Fine Art",
        "departments": [
            "Department of Civil Engineering",
            "Department of Electrical Engineering",
            "Department of Mechanical Engineering",
            "Department of Applied Design and Fine Art",
        ],
    },

    # 4. COMPUTING, LIBRARY & INFORMATION SCIENCE
    {
        "faculty": "Faculty of Computing, Library and Information Science",
        "departments": [
            "Department of Computer Science",
            "Department of Information Technology",
            "Department of Library and Information Science",
        ],
    },

    # 5. SCIENCE
    {
        "faculty": "Faculty of Science",
        "departments": [
            "Department of Biological Sciences",
            "Department of Chemistry",
            "Department of Physics",
            "Department of Mathematics",
        ],
    },

    # 6. ECONOMICS & MANAGEMENT SCIENCES
    {
        "faculty": "Faculty of Economics and Management Sciences",
        "departments": [
            "Department of Economics and Statistics",
            "Department of Management Sciences",
            "Department of Business Studies, Procurement and Management",
        ],
    },

    # 7. SOCIAL SCIENCES
    {
        "faculty": "Faculty of Social Sciences",
        "departments": [
            "Department of Social Work and Social Administration",
            "Department of Governance",
            "Department of Sociology",
            "Department of Culture and Heritage Studies",
            "Department of Psychology",
        ],
    },

    # 8. EDUCATION
    {
        "faculty": "Faculty of Education",
        "departments": [
            "Department of Humanities Education",
            "Department of Science Education",
            "Department of Foundations of Education",
            "Department of Open Learning and Computer Education",
        ],
    },

    # 9. LAW
    {
        "faculty": "Faculty of Law",
        "departments": [
            "Department of Law and Jurisprudence",
            "Department of Commercial Law",
            "Department of Public and Comparative Law",
            "Department of Human Rights, Peace and Clinical Legal Education",
            "Department of Environmental Law",
        ],
    },

    # 10. INSTITUTE OF LANGUAGE STUDIES
    {
        "faculty": "Institute of Language Studies",
        "departments": [
            "Department of English Language",
            "Department of Runyakitara",
            "Department of French and Other Foreign Languages",
        ],
    },

    # 11. INSTITUTE OF TOURISM & HOSPITALITY
    {
        "faculty": "Institute of Tourism and Hospitality",
        "departments": [
            "Department of Tourism Management",
            "Department of Hospitality Operations",
        ],
    },
]


# ─────────────────────────────────────────────────────────────────────────────
# SEEDER  (idempotent — safe to run multiple times)
# ─────────────────────────────────────────────────────────────────────────────

async def seed(db: AsyncSession) -> None:
    for entry in KAB_STRUCTURE:
        faculty_name = entry["faculty"]

        result = await db.execute(select(Faculty).where(Faculty.name == faculty_name))
        faculty = result.scalar_one_or_none()

        if not faculty:
            faculty = Faculty(name=faculty_name, is_active=True)
            db.add(faculty)
            await db.flush()          # get faculty.id before inserting departments
            print(f"  ✓  Faculty created : {faculty_name}")
        else:
            print(f"  —  Already exists  : {faculty_name}")

        for dept_name in entry["departments"]:
            result = await db.execute(
                select(Department).where(
                    Department.name == dept_name,
                    Department.faculty_id == faculty.id,
                )
            )
            dept = result.scalar_one_or_none()

            if not dept:
                db.add(Department(name=dept_name, faculty_id=faculty.id, is_active=True))
                print(f"        ✓  Dept created : {dept_name}")
            else:
                print(f"        —  Dept exists  : {dept_name}")

    await db.commit()
    print("\n✅  Seeding complete.")


# ─────────────────────────────────────────────────────────────────────────────
# STANDALONE RUNNER
# ─────────────────────────────────────────────────────────────────────────────

async def main():
    async with AsyncSessionLocal() as db:
        print("Seeding Kabale University faculties and departments...\n")
        await seed(db)

if __name__ == "__main__":
    asyncio.run(main())