import React, { useContext, useEffect, useState } from "react";
import "./UserPages.css";
import Card from "../../shared/components/UIElements/Card";
import { useHttpClient } from "../../shared/hooks/useHttpClients";
import { AuthContext } from "../../shared/context/authContext";
import useForm from "../../shared/hooks/useForm";
import Input from "../../shared/components/FormElements/Input";
import { VALIDATOR_REQUIRE } from "../../shared/util/validators";
import { Link, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import Modal from "../../shared/components/UIElements/Modal";
import Button from "../../shared/components/FormElements/Buttons";
import Avatar from "../../shared/components/UIElements/Avatar";

const Account = () => {
    const { isLoading, error, sendRequest, emptyError } = useHttpClient();
    const [user, setUser] = useState(null);
    const [loadedPlaces, setLoadedPlaces] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { userId, logout } = useContext(AuthContext);
    const history = useHistory()
    const [formState, inputHandler, setFormData] = useForm(
      {
        name: {
          value: "",
          isValid: false,
        },
      },
      false
    );


    if(error === "No place was found for the provided user."){
      emptyError()
    }
    
    useEffect(() => {
      const fetchUser = async () => {
        try {
          const responseData = await sendRequest(
            `http://localhost:5000/api/users/${userId}`
          );
          setUser(responseData.user);
  
          setFormData(
            {
              name: {
                value: responseData.user.name,
                isValid: true,
              },
            },
            true
          );
        } catch (err) {}
      };
  
      fetchUser();
  
      const fetchUserPlaces = async () => {
        try {
          const responseData = await sendRequest(
            `http://localhost:5000/api/places/user/${userId}`
          );
          setLoadedPlaces(responseData.places);
        } catch (err) {}
      };
  
      fetchUserPlaces();
    }, [sendRequest, userId, setFormData]);
  
    const changeUsernameHandler = async () => {

      if(!showInput){
        emptyError()
      }

      if (!showInput) {
        setShowInput(true);
      } else {
        try {
          await sendRequest(
            `http://localhost:5000/api/users/${userId}`,
            "PATCH",
            JSON.stringify({
              name: formState.inputs.name.value,
            }),
            {
              "Content-Type": "application/json",
            }
          );
  
          setUser((prevUser) => ({
            ...prevUser,
            name: formState.inputs.name.value,
          }));
        } catch (err) {
          console.error(err);
        }

        setShowInput(false);
      }
    };

    const cancelHandler = () => {
        setFormData(
          {
            name: {
              value: user.name,
              isValid: true,
            },
          },
          true
        );
        setShowInput(false);
      };
  
    if (isLoading || !user) {
      return (
        <div className="center">
          <p>Loading...</p>
        </div>
      );
    }

    const showOrCloseModal = () => {
        setShowModal(!showModal)
    }

    const confirmDeletion = async() => {

        try {
            await sendRequest(
              `http://localhost:5000/api/users/${userId}`,"DELETE"
            );
            history.push("/");
          } catch (err) {
            console.log(err)
          }
        setShowModal(false)
        logout()
    }
  
    return (
      <main className="account-main">
        <Modal
        show={showModal}
        className="user-modal"
        header={"Confirm Deletion"}
        onCancel={showOrCloseModal}
        contentClass="user-item__modal-content"
        button={<Button onClick={confirmDeletion}> Delete</Button>}
        footerClass="place-item__modal-actions"
        footer={<Button onClick={showOrCloseModal}>CLOSE</Button>}
      >Are you sure you want to delete your account ? If you delete your account then all your places will also be deleted.</Modal>
        <Card className="account">
          <div className="user">
          <Avatar image={`http://localhost:5000/${user.image}`}/>
            <p>{user.name}</p>
            { error && <h3 className="error-text">{error}</h3> }
            {showInput && (<div className="input-div">
              <Input
                id="name"
                element="input"
                type="text"
                validators={[VALIDATOR_REQUIRE()]}
                errorText="Please enter a valid username."
                onInput={inputHandler}
                initialValue={formState.inputs.name.value}
                initialValid={formState.inputs.name.isValid}
              />
            </div>)}

          </div>
          <div className="btn-div">
            <button className="submit-btn"
              onClick={changeUsernameHandler}
              disabled={showInput && !formState.isValid}
            >
              {showInput ? "Save Username" : "Change Username"}
            </button> 
            { showInput && <button className="cancel-btn" onClick={cancelHandler}>Cancel</button>}
          </div>
            <div className="email-div">
                <h2>Your Email:</h2>
                <h4>{user.email}</h4>
            </div>
          { loadedPlaces.length > 0 && <div className="places-div">
            <h3>My Places</h3>
            <div className="places">
            {loadedPlaces.map((place) => (
              <ul key={place.id}><li><Link className="place-link" to={`/${userId}/places`}>{place.title}</Link></li></ul>
            ))}
            </div>
          </div>}
          <div className="delete-div">
          <button className="delete-btn" onClick={showOrCloseModal}>Delete Account</button>
          </div>
        </Card>
      </main>
    );
  };
  
  export default Account;
  