import React, { useCallback, useContext, useReducer } from "react";

import "./PlacePages.css";
import Input from "../../shared/components/FormElements/Input";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import Button from "../../shared/components/FormElements/Buttons";
import useForm from "../../shared/hooks/useForm";
import { useHttpClient } from "../../shared/hooks/useHttpClients";
import { AuthContext } from "../../shared/context/authContext";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ImagePicker from "../../shared/components/FormElements/ImagePicker";



export default function NewPlace() {

  const { isLoading, error, sendRequest, emptyError  } = useHttpClient()
  const { userId, token } = useContext(AuthContext)
  const history = useHistory();

    const [formState,inputHandler] =  useForm({
    title: {
      value: "",
      isValid: false,
    },
    description: {
      value: "",
      isValid: false,
    },
    address: {
      value: "",
      isValid: false,
    },
    image:{
      value:null,
      isValid: false 
    }
  },false)

  const addPlaceHandler = async(event) => {
    event.preventDefault(); 
    const formData = new FormData()
    formData.append("title",formState.inputs.title.value)
    formData.append("description",formState.inputs.description.value)
    formData.append("address",formState.inputs.address.value)
    formData.append("creator",userId)
    formData.append("image",formState.inputs.image.value)
    const responseData = await sendRequest("http://localhost:5000/api/places","POST",
      formData,{ Authorization:`Bearer ${token}` }
    )
    history.push("/")
  };

  return (
    <>
    <ErrorModal error={error} onClear={emptyError} />
    <form className="place-form" onSubmit={addPlaceHandler}>
      { isLoading && <LoadingSpinner asOverlay /> }
      <Input
        id="title"
        element="input"
        type="text"
        label="Title"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title."
        onInput={inputHandler}
      />

      <Input
        id="description"
        element="textarea"
        label="Description"
        validators={[VALIDATOR_MINLENGTH(6)]}
        errorText="Please enter a valid description."
        onInput={inputHandler}
      />

    <ImagePicker center id="image" onInput={inputHandler}/> 

      <Input
        id="address"
        element="input"
        label="Address"
        validators={[VALIDATOR_REQUIRE]}
        errorText="Please enter a valid Address."
        onInput={inputHandler}
      />

      <Button type="submit" disabled={!formState.isValid}>
        Add Place
      </Button>
    </form>
    </>
  );
}
