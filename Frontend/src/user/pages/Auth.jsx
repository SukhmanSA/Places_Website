import React, { useContext, useState } from "react";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Buttons"
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import useForm from "../../shared/hooks/useForm";
import "./UserPages.css"
import Card from "../../shared/components/UIElements/Card";
import { AuthContext } from "../../shared/context/authContext";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { useHttpClient } from "../../shared/hooks/useHttpClients";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ImagePicker from "../../shared/components/FormElements/ImagePicker";
import GoogleAuth from "../components/googleAuth";


export default function Auth() {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const { isLoading, error, sendRequest, emptyError  } = useHttpClient()
    const history = useHistory();

    const { login, token } = useContext(AuthContext)

    const [formState, inputHandler, setFormData] = useForm(
      {
        email: {
          value: '',
          isValid: false
        },
        password: {
          value: '',
          isValid: false
        }
      },
      false
    );
  
    const switchModeHandler = () => {
      if (!isLoginMode) {
        setFormData(
          {
            ...formState.inputs,
            name: undefined,
            image:undefined
          },
          formState.inputs.email.isValid && formState.inputs.password.isValid
        );
      } else {
        setFormData(
          {
            ...formState.inputs,
            name: {
              value: '',
              isValid: false
            },
            image:{
              value:null
            }
          },
          false
        );
      }
      setIsLoginMode(prevMode => !prevMode);
    };
  
    const authSubmitHandler = async event => {
      event.preventDefault();
      console.log(formState.inputs)

      if (isLoginMode) {
        const response = await sendRequest('http://localhost:5000/api/users/login', 
          'POST',
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value
          }),
          {
            'Content-Type': 'application/json'
          }
        );
        
        login(response.userId,response.token);
        history.push("/")
      } else {
        const formData = new FormData()
        formData.append("name",formState.inputs.name.value)
        formData.append("email",formState.inputs.email.value)
        formData.append("password",formState.inputs.password.value)
        formData.append("image",formState.inputs.image.value)
        const response = await sendRequest('http://localhost:5000/api/users/signup', 
            'POST',
            formData
          );
          
          login(response.userId,response.token);
          history.push("/")
    
      }
    };

  
    return (
      <Card className="authentication">
        <ErrorModal error={error} onClear={emptyError} />
        { isLoading && <LoadingSpinner asOverlay/> }
        <h2>{ isLoginMode ? "Login" : "Signup" } Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a name."
              onInput={inputHandler}
            />
          )}
          {!isLoginMode && <ImagePicker center id="image" onInput={inputHandler}/> }
          <Input
            element="input"
            id="email"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password, at least 6 characters."
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
        </form>
        <GoogleAuth history={history} login={login} />
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
        </Button>
      </Card>
    );
}
