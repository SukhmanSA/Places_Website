import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Buttons";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import useForm from "../../shared/hooks/useForm";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import Card from "../../shared/components/UIElements/Card";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { useHttpClient } from "../../shared/hooks/useHttpClients";
import { useContext } from "react";
import { AuthContext } from "../../shared/context/authContext";



export default function UpdatePlace() {
  const { token } = useContext(AuthContext)
  const [loadedPlace,setLoadedPlace] = useState(undefined);
  const { isLoading, error, sendRequest, emptyError  } = useHttpClient();
  const placeId = useParams().pid;
  const history = useHistory();
  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/places/${placeId}`
        );
        setLoadedPlace(responseData.place);
      } catch (err) {}
    };
    fetchPlaces();

    if (loadedPlace) {
      console.log(responseData)
      setFormData(
        {
          title: {
            value: responseData.place.title,
            isValid: true,
          },
          description: {
            value: responseData.place.description,
            isValid: true,
          },
        },
        true
      );
    }

  }, [sendRequest, setFormData]);

  const placeUpdateSubmitHandler = async(event) => {
    try {
      await sendRequest(
        `http://localhost:5000/api/places/${placeId}`,"PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value
        }),
        {
          'Content-Type': 'application/json',
           Authorization:`Bearer ${token}`          
        }
      );
    } catch (err) {}
    history.push(`/`)
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedPlace && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={emptyError} />
      {!isLoading && loadedPlace && (
        <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (min. 5 characters)."
            onInput={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </React.Fragment>
  );
}
