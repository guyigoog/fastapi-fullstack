from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Clients, ClientCreate, ClientsPublic, ClientPublic

router = APIRouter()


@router.get("/", response_model=ClientsPublic)
def get_clients(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve clients.
    """

    count_statement = select(func.count()).select_from(Clients)
    count = session.exec(count_statement).one()

    statement = select(Clients).offset(skip).limit(limit)
    users = session.exec(statement).all()

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
