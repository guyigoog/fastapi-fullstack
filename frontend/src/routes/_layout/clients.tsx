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

import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { ClientService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"

export const Route = createFileRoute("/_layout/clients")({
  component: Clients,
})

function ClientsTableBody() {
  const { data: clients } = useSuspenseQuery({
    queryKey: ["clients"],
    queryFn: () => ClientService.getClients({}),
  })

  return (
    <Tbody>
      {clients.data.map((item) => (
          <Tr key={item.id}>
            <Td>{item.id}</Td>
            <Td>{item.name}</Td>
            <Td>{item.nickname}</Td>
            <Td>{item.instagram}</Td>
            <Td>{item.openForConnections}</Td>
            <Td>{item.priority}</Td>
            <Td>{item.isReached}</Td>
            <Td>{item.status}</Td>
            <Td>
                <ActionsMenu
                    id={item.id}
                    type={"Client"}
                    status={item.status}
                />
            </Td>
            </Tr>
      ))}
    </Tbody>
  )
}
function ClientsTable() {
  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>name</Th>
            <Th>nickname</Th>
            <Th>instagram</Th>
            <Th>Open for connections</Th>
            <Th>priority</Th>
            <Th>Is reached</Th>
            <Th>status</Th>
            <Th>actions</Th>
          </Tr>
        </Thead>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Tbody>
              <Tr>
                <Td colSpan={4}>Something went wrong: {error.message}</Td>
              </Tr>
            </Tbody>
          )}
        >
          <Suspense
            fallback={
              <Tbody>
                {new Array(5).fill(null).map((_, index) => (
                  <Tr key={index}>
                    {new Array(4).fill(null).map((_, index) => (
                      <Td key={index}>
                        <Flex>
                          <Skeleton height="20px" width="20px" />
                        </Flex>
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            }
          >
            <ClientsTableBody />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}

function Clients() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Clients Management
      </Heading>

      <Navbar type={"Client"} />
      <ClientsTable />
    </Container>
  )
}
