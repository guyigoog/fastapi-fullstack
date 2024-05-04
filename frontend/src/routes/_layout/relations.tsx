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
import { RelationService } from "../../client"
// import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"

export const Route = createFileRoute("/_layout/relations")({
  component: Relations,
})

function RelationsTableBody() {
  const { data: relations } = useSuspenseQuery({
    queryKey: ["relations"],
    queryFn: () => RelationService.getRelations({}),
  })

  return (
    <Tbody>
      {relations.data.map((item) => (
          <Tr key={item.id}>
            <Td>{item.id}</Td>
            <Td>{item.fromClientId}</Td>
            <Td>{item.toClientId}</Td>
            <Td>{item.status === 0 ? "inactive" : "active"}</Td>
            <Td>
                {/*<ActionsMenu*/}
                {/*    id={item.id}*/}
                {/*    type={"Relation"}*/}
                {/*    status={item.status}*/}
                {/*/>*/}
            </Td>
            </Tr>
      ))}
    </Tbody>
  )
}

function RelationsTable() {
  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>From Client ID</Th>
            <Th>To Client ID</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Tbody>
              <Tr>
                <Td colSpan={5}>Something went wrong: {error.message}</Td>
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
            <RelationsTableBody />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}

function Relations() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Relations Management
      </Heading>

      <Navbar type={"Relation"} />
      <RelationsTable />
    </Container>
  )
}