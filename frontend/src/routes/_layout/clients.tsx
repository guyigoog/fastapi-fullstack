import {
  Container,
  Flex,
  Heading,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import React, {Suspense, useEffect, useState} from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ClientService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"

export const Route = createFileRoute("/_layout/clients")({
  component: Clients,
})

function ClientsTableBody({ searchTerm }) {
  const { data: clients } = useSuspenseQuery({
    queryKey: ["clients"],
    queryFn: () => ClientService.getClients({}),
  });

  const [filteredClients, setFilteredClients] = useState(clients.data);

  useEffect(() => {
    const filtered = clients.data.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.instagram.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients.data]); // Dependency on searchTerm and clients.data

  return (
    <Tbody>
      {filteredClients.map((client) => (
        <Tr key={client.id}>
          <Td>{client.id}</Td>
          <Td>{client.name}</Td>
          <Td>{client.nickname}</Td>
          <Td>{client.instagram}</Td>
          <Td>{client.openForConnections ? "Yes" : "No"}</Td>
          <Td>{client.priority}</Td>
          <Td>{client.isReached ? "Yes" : "No"}</Td>
          <Td>{client.status}</Td>
          <Td>
            <ActionsMenu
                id={client.id}
                type={"Client"}
                status={client.status}
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  );
}

function ClientsTable({ searchTerm }) {
  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Nickname</Th>
            <Th>Instagram</Th>
            <Th>Open for Connections</Th>
            <Th>Priority</Th>
            <Th>Is Reached</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Tbody>
              <Tr>
                <Td colSpan={9}>Something went wrong: {error.message}</Td>
              </Tr>
            </Tbody>
          )}
        >
          <Suspense
            fallback={
              <Tbody>
                {new Array(5).fill(null).map((_, index) => (
                  <Tr key={index}>
                    {new Array(9).fill(null).map((_, index) => (
                      <Td key={index}>
                        <Skeleton height="20px" width="20px" />
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            }
          >
            <ClientsTableBody searchTerm={searchTerm} />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}


function Clients() {
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Clients Management
      </Heading>

      <Navbar type={"Client"} onSearch={setSearchTerm} />
      <ClientsTable searchTerm={searchTerm} />
    </Container>
  )
}

