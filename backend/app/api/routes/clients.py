from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import aliased
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Clients, ClientCreate, ClientsPublic, ClientPublic, RelationsPublic, Relations, RelationWithRelations
import logging

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/", response_model=ClientsPublic)
def get_clients(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve clients.
    """

    count_statement = select(func.count()).select_from(Clients)
    count = session.exec(count_statement).one()

    statement = select(Clients).offset(skip).limit(limit)
    users = session.exec(statement).all()
    logger.info(f"users: {users}")
    logger.info(f"count: {count}")
    logger.info("Guy!!!")
    return ClientsPublic(data=users, count=count)


@router.post("/", response_model=Clients)
def create_client(
        *, session: SessionDep, current_user: CurrentUser, client_in: ClientCreate
) -> Any:
    """
    Create new Client.
    """
    client = Clients.model_validate(client_in, update={"owner_id": current_user.id})
    session.add(client)
    session.commit()
    session.refresh(client)
    return client


# get client by id
@router.get("/{client_id}", response_model=ClientPublic)
def get_client_by_id(client_id: int, session: SessionDep) -> Any:
    """
    Retrieve client by id.
    """
    statement = select(Clients).where(Clients.id == client_id)
    client = session.exec(statement).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/{client_id}/relations", response_model=RelationsPublic)
def get_client_relations(client_id: int, session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve relations associated with a client, including client data.
    """
    from_client = aliased(Clients)
    to_client = aliased(Clients)
    inner_from_client = aliased(Clients)
    inner_to_client = aliased(Clients)

    # Query the client to check if it exists
    client = session.exec(select(Clients).where(Clients.id == client_id)).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Count total relations for the client
    count_statement = (
        select(func.count())
        .where((Relations.fromClientId == client_id) | (Relations.toClientId == client_id))
    )
    count = session.exec(count_statement).one()

    # Query relations with client data for both source and target clients
    relations_statement = (
        select(
            Relations,
            from_client.name.label("from_client_name"),
            to_client.name.label("to_client_name"),
        )
        .join(from_client, Relations.fromClientId == from_client.id)
        .join(to_client, Relations.toClientId == to_client.id)
        .where((Relations.fromClientId == client_id) | (Relations.toClientId == client_id))
        .offset(skip)
        .limit(limit)
    )
    relations = session.exec(relations_statement).all()
    logger.info(f"relations: {relations}")
    # Create a list of dictionaries with the expected format
    data = []
    for relation, from_client_name, to_client_name in relations:
        relation_dict = relation.dict()
        relation_dict["from_client_name"] = from_client_name
        relation_dict["to_client_name"] = to_client_name

        # Fetch relations of relations (2 levels deep)
        inner_relations_statement = (
            select(
                Relations,
                inner_from_client.name.label("from_client_name"),
                inner_to_client.name.label("to_client_name"),
            )
                .join(inner_from_client, Relations.fromClientId == inner_from_client.id)
                .join(inner_to_client, Relations.toClientId == inner_to_client.id)
                .where(
                (Relations.fromClientId == relation.toClientId)
                | (Relations.toClientId == relation.toClientId)
            )
                .where(
                Relations.id != relation.id  # Make sure not to include the parent relation itself
            )
        )

        inner_relations = session.exec(inner_relations_statement).all()

        inner_data = []
        for inner_relation, inner_from_client_name, inner_to_client_name in inner_relations:
            inner_relation_dict = inner_relation.dict()
            inner_relation_dict["from_client_name"] = inner_from_client_name
            inner_relation_dict["to_client_name"] = inner_to_client_name
            inner_data.append(inner_relation_dict)

        relation_dict["relations"] = inner_data

        data.append(relation_dict)

    logger.info(f"data: {data}")
    return RelationsPublic(data=data, count=count)
