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
import { RelationService } from "../../client"
// import ActionsMenu from "../../components/Common/ActionsMenu"
import Navbar from "../../components/Common/Navbar"

export const Route = createFileRoute("/_layout/relations")({
  component: Relations,
})

function RelationsTableBody({ searchTerm }) {
  const { data: relations } = useSuspenseQuery({
    queryKey: ["relations"],
    queryFn: () => RelationService.getRelations({}),
  });

  const [filteredRelations, setFilteredRelations] = useState(relations.data);

   useEffect(() => {
    const filtered = relations.data.filter(relation =>
        relation.from_client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        relation.to_client_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredRelations(filtered);
  }, [searchTerm, relations.data]); // Dependency on searchTerm and clients.data
  return (
    <Tbody>
      {filteredRelations.map((item) => (
          <Tr key={item.id}>
            <Td>{item.id}</Td>
            <Td>{item.fromClientId}</Td>
            <Td>{item.from_client_name}</Td>
            <Td>{item.toClientId}</Td>
            <Td>{item.to_client_name}</Td>
            <Td>{item.status === 0 ? "inactive" : "active"}</Td>
            <Td>
                {/* Actions Menu here */}
            </Td>
          </Tr>
      ))}
    </Tbody>
  );
}


function RelationsTable({ searchTerm }) {
  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>From Client ID</Th>
            <Th>From Client Name</Th>
            <Th>To Client ID</Th>
            <Th>To Client Name</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Tbody>
              <Tr>
                <Td colSpan={7}>Something went wrong: {error.message}</Td>
              </Tr>
            </Tbody>
          )}
        >
          <Suspense
            fallback={
              <Tbody>
                {new Array(5).fill(null).map((_, index) => (
                  <Tr key={index}>
                    {new Array(7).fill(null).map((_, index) => (
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
            <RelationsTableBody searchTerm={searchTerm} />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}

function Relations() {
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Relations Management
      </Heading>

      <Navbar type={"Relation"} onSearch={setSearchTerm} />
      <RelationsTable searchTerm={searchTerm} />
    </Container>
  )
}
