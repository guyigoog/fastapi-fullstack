import {
    Container,
    Heading,
    Skeleton,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr, useToast,
} from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useNavigate } from "@tanstack/react-router";

import React, {Suspense, useEffect, useState} from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ClientService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"
import { LiaProjectDiagramSolid } from "react-icons/lia";
export const Route = createFileRoute("/_layout/clients")({
  component: Clients,
})

function ClientsTableBody({ searchTerm }) {
    const navigate = useNavigate(); // Hook for navigation
    const toast = useToast(); // Hook for toast notifications
    const { data: clients } = useSuspenseQuery({
        queryKey: ["clients"],
        queryFn: ClientService.getClients,
    });

    const [filteredClients, setFilteredClients] = useState([]);

    useEffect(() => {
        if (clients?.data) {
            const filtered = clients.data.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.instagram.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredClients(filtered);
        }
    }, [searchTerm, clients?.data]); // Check if clients.data is defined before using it

    const handleClientClick = (clientId) => {
        console.log("Client ID clicked: ", clientId);
        navigate({ to: `/search?clientId=${clientId}` });
        toast({
      title: "Redirected",
      description: `You have been redirected to the client (${clientId}) relations page.`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    };

    return (
        <Tbody>
            {filteredClients.map((client) => (
                <Tr key={client.id}>
                    <Td cursor="pointer" onClick={() => handleClientClick(client.id)}>{client.id}<LiaProjectDiagramSolid /></Td>
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

function ErrorFallback({ error }) {
    return <div>Something went wrong: {error.message}</div>;
}

function Clients() {
  const [searchTerm, setSearchTerm] = React.useState('');

    return (
        <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
                  Clients Management
      </Heading>
            <Navbar type={"Client"} onSearch={setSearchTerm} />
            <Suspense fallback={<Skeleton height="40px" count={5} />}>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <ClientsTable searchTerm={searchTerm} />
                </ErrorBoundary>
            </Suspense>
        </Container>
    );
}

