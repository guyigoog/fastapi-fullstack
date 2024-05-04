import React, { useEffect, useState } from "react";
import { request as __request } from '../../client/core/request';
import { OpenAPI } from '../../client';
import { Graph } from "react-d3-graph";
import { Box, Heading, Button, useToast } from "@chakra-ui/react";
const CircleGraph = () => {
  const [relations, setRelations] = useState([]);
  const [error, setError] = useState(null);
  const clientId = new URLSearchParams(window.location.search).get('clientId');


    const NoClientId = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const goToClientsPage = () => {
    navigate({to:'/clients'});
    toast({
      title: "Redirected",
      description: "You have been redirected to the clients page.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={5} maxW="lg" borderWidth="1px" borderRadius="lg" overflow="hidden" textAlign="center">
      <Heading mb={4}>No client ID provided</Heading>
      <Button colorScheme="teal" onClick={goToClientsPage}>Go to clients page</Button>
    </Box>
  );
};

  if (!clientId) { // Check if client ID is provided jf not return error message and show button to go to clients page
    return (
      <NoClientId />
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await __request(OpenAPI, {
          method: 'GET',
          url: `/api/v1/clients/${clientId}/relations`,
          mediaType: 'application/json',
          errors: {
            422: `Validation Error`,
          },
        });
        setRelations(response.data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, [clientId]);

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  // Function to convert relations data to graph nodes and links
  const convertToGraphData = () => {
    const nodes = [];
    const links = [];

    relations.forEach(relation => {
      const fromNode = {
        id: relation.from_client_name,
        label: relation.from_client_name,
        color: 'red',
        size: 5000,
        fontSize: 14,
        renderLabel: true,
        labelProperty: 'label',
        labelPosition: 'center',
      };
      const toNode = {
        id: relation.to_client_name,
        label: relation.to_client_name,
        color: 'lightgreen',
        size: 4500,
        fontSize: 14,
        fontWeight: 'bold',
        renderLabel: true,
        labelProperty: 'label',
        labelPosition: 'center',
      };

      if (!nodes.find(node => node.id === fromNode.id)) {
        nodes.push(fromNode);
      }
      if (!nodes.find(node => node.id === toNode.id)) {
        nodes.push(toNode);
      }

      links.push({
        source: fromNode.id,
        target: toNode.id,
      });

      if (relation.relations) {
        console.log(relation.relations);
        relation.relations.forEach(subRelation => {
                const subFromNode = {
        id: subRelation.from_client_name,
        label: subRelation.from_client_name,
      };
          const subToNode = {
            id: subRelation.to_client_name,
            label: subRelation.to_client_name,
            color: 'lightblue',
            size: 4500,
            fontSize: 14,
            fontWeight: 'bold',
            labelPosition: 'center',
          };

          if (!nodes.find(node => node.id === subToNode.id)) {
            nodes.push(subToNode);
          }

          links.push({
            source: subFromNode.id,
            target: subToNode.id,
          });
        });
      }
    });

    return {
      nodes,
      links,
    };
  };

  const graphData = convertToGraphData();

// Graph configuration
const myConfig = {
  nodeHighlightBehavior: true,
  node: {
    color: "lightgreen",
    size: 4500,
    highlightStrokeColor: "blue",
    renderLabel: true,
  },
  link: {
    highlightColor: "lightblue",
    strokeWidth: 3,
  },
  directed: true,
    d3: {
    gravity: -1000,
    },
  width: 800,
  height: 800,
};


  return (
    <div style={{ height: '500px', width: '100%' }}>
      <Graph
        id="graph-id"
        data={graphData}
        config={myConfig}
      />
    </div>
  );
};

export default CircleGraph;

// Now you can use the CircleGraph component in your Route definition
import {createFileRoute, useNavigate} from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/search")({
  component: CircleGraph,
});