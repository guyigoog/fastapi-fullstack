from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func
from sqlalchemy.orm import aliased
from app.api.deps import CurrentUser, SessionDep
from app.models import Relations, RelationsCreate, RelationsPublic, Clients
router = APIRouter()


@router.get("/", response_model=RelationsPublic)
def get_relations(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve relations with client names.
    """
    from_client = aliased(Clients)
    to_client = aliased(Clients)

    count_statement = select(func.count()).select_from(Relations)
    count = session.exec(count_statement).one()

    statement = (
        select(
            Relations,
            from_client.name.label("from_client_name"),
            to_client.name.label("to_client_name"),
        )
        .join(from_client, Relations.fromClientId == from_client.id)
        .join(to_client, Relations.toClientId == to_client.id)
        .offset(skip)
        .limit(limit)
    )
    relations = session.exec(statement).all()
    # logger.info(relations)
    # Create a list of dictionaries with the expected format
    data = [
        {
            "id": relation.id,
            "fromClientId": relation.fromClientId,
            "toClientId": relation.toClientId,
            "status": relation.status,
            "from_client_name": from_client_name,
            "to_client_name": to_client_name,
        }
        for relation, from_client_name, to_client_name in relations
    ]
    return RelationsPublic(data=data, count=count)

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
