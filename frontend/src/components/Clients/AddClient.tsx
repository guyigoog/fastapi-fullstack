import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientService } from "../../client";
import { ApiError } from "../../client/core/ApiError";
import useCustomToast from "../../hooks/useCustomToast";

interface AddClientProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClientCreateForm {
  name: string;
  nickname: string;
  instagram: string;
  openForConnections:number;
  isReached: number;
  priority: number;
}

const AddClient = ({ isOpen, onClose }: AddClientProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientCreateForm>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      nickname: "",
      instagram: "",
      openForConnections: 1,
      priority: 0,
      isReached: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ClientCreateForm) =>
      ClientService.createClient({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Client created successfully.", "success");
      reset();
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const onSubmit: SubmitHandler<ClientCreateForm> = (data) => {
    console.log(data);
    mutation.mutate(data);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Client</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Name"
                type="text"
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.nickname}>
              <FormLabel htmlFor="nickname">Nickname</FormLabel>
              <Input
                id="nickname"
                {...register("nickname", { required: "Nickname is required" })}
                placeholder="Nickname"
                type="text"
              />
              <FormErrorMessage>{errors.nickname?.message}</FormErrorMessage>
            </FormControl>
            <FormControl mt={4} isInvalid={!!errors.instagram}>
              <FormLabel htmlFor="instagram">Instagram</FormLabel>
              <Input
                id="instagram"
                {...register("instagram")}
                placeholder="Instagram"
                type="text"
              />
              <FormErrorMessage>{errors.instagram?.message}</FormErrorMessage>
            </FormControl>
            <FormControl mt={4} isRequired isInvalid={!!errors.priority}>
              <FormLabel htmlFor="priority">Priority</FormLabel>
              <Input
                id="priority"
                {...register("priority", { required: "Priority is required" })}
                placeholder="Priority"
                type="number"
              />
              <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="openForConnections">Open for Connections</FormLabel>
              <input
                id="openForConnections"
                {...register("openForConnections")}
                type="checkbox"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor="isReached">is reached already?</FormLabel>
              <input
                id="isReached"
                {...register("isReached")}
                type="checkbox"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} type="submit" isLoading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddClient;
