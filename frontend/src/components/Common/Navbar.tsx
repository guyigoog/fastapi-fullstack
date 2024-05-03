import { Button, Flex, Icon, useDisclosure, InputGroup, InputLeftElement, Input } from "@chakra-ui/react"
import { FaPlus, FaSearch } from "react-icons/fa"

import AddUser from "../Admin/AddUser"
import AddItem from "../Items/AddItem"
import AddClient from "../Clients/AddClient"
import AddRelation from "../Relations/AddRelation"

interface NavbarProps {
  type: string
}

const Navbar = ({ type }: NavbarProps) => {
  const addUserModal = useDisclosure()
  const addItemModal = useDisclosure()
  const addClientModal = useDisclosure();
  const addRelationModal = useDisclosure();

  const handleAddClick = () => {
    if (type === "Client") {
      addClientModal.onOpen();
    } else if (type === "Relation") {
      addRelationModal.onOpen();
    } else {
      type === "User" ? addUserModal.onOpen() : addItemModal.onOpen();
    }
  };

  return (
    <>
      <Flex py={8} gap={4}>
        {/* TODO: Complete search functionality */}
        { <InputGroup w={{ base: '100%', md: 'auto' }}>
                    <InputLeftElement pointerEvents='none'>
                        <Icon as={FaSearch} color='ui.dim' />
                    </InputLeftElement>
                    <Input type='text' placeholder='Search' fontSize={{ base: 'sm', md: 'inherit' }} borderRadius='8px' />
                </InputGroup> }
        <Button
          variant="primary"
          gap={1}
          fontSize={{ base: "sm", md: "inherit" }}
          onClick={handleAddClick}
        >
          <Icon as={FaPlus} /> Add {type}
        </Button>
        <AddUser isOpen={addUserModal.isOpen} onClose={addUserModal.onClose} />
        <AddItem isOpen={addItemModal.isOpen} onClose={addItemModal.onClose} />
        <AddClient isOpen={addClientModal.isOpen} onClose={addClientModal.onClose} />
        <AddRelation isOpen={addRelationModal.isOpen} onClose={addRelationModal.onClose} />
      </Flex>
    </>
  )
}

export default Navbar
