"""add grant_call_interests table

Revision ID: a1b2c3d4e5f6
Revises: 8796dd2cac3b
Create Date: 2026-06-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '8796dd2cac3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'grant_call_interests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('grant_call_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('cloudinary_url', sa.Text(), nullable=False),
        sa.Column('cloudinary_public_id', sa.String(length=255), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['grant_call_id'], ['grant_calls.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('grant_call_id', 'user_id', name='uq_grant_call_interest_user'),
    )
    op.create_index(op.f('ix_grant_call_interests_id'), 'grant_call_interests', ['id'], unique=False)
    op.create_index(op.f('ix_grant_call_interests_grant_call_id'), 'grant_call_interests', ['grant_call_id'], unique=False)
    op.create_index(op.f('ix_grant_call_interests_user_id'), 'grant_call_interests', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_grant_call_interests_user_id'), table_name='grant_call_interests')
    op.drop_index(op.f('ix_grant_call_interests_grant_call_id'), table_name='grant_call_interests')
    op.drop_index(op.f('ix_grant_call_interests_id'), table_name='grant_call_interests')
    op.drop_table('grant_call_interests')
