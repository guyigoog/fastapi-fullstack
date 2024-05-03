from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func

from app.api.deps import CurrentUser, SessionDep
from app.models import Relations, RelationsCreate, RelationsPublic

router = APIRouter()


@router.get("/", response_model=RelationsPublic)
def get_relations(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve relations.
    """
    count_statement = select(func.count()).select_from(Relations)
    count = session.exec(count_statement).scalar()

    statement = select(Relations).offset(skip).limit(limit)
    relations = session.exec(statement).all()

    return RelationsPublic(data=relations, count=count)


@router.post("/", response_model=Relations)
def create_relation(
        *,
        session: SessionDep,
        current_user: CurrentUser,
        relation_in: RelationsCreate
) -> Any:
    """
    Create new relation.
    """
    relation = Relations(**relation_in.dict(), owner_id=current_user.id)
    session.add(relation)
    session.commit()
    session.refresh(relation)
    return relation
