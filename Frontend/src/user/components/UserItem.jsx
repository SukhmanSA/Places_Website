import React, { useContext } from 'react'
import { Link } from 'react-router-dom/cjs/react-router-dom.min'
import Card from '../../shared/components/UIElements/Card';
import Avatar from '../../shared/components/UIElements/Avatar';
import "./UserItem.css"
import { AuthContext } from '../../shared/context/authContext';

export default function UsersItem({user}) {

  const { id,name,image,places, googleAuth } = user
  console.log(user)
    return (
      <li className="user-item">
        <Card className="user-item__content">
          <Link to={`/${id}/places`}>
            <div className="user-item__image">
              { googleAuth ? <Avatar image={image} alt={name} /> : <Avatar image={`http://localhost:5000/${user.image}`} alt={name} />}
            </div>
            <div className="user-item__info">
              <h2>{name}</h2>
              <h3>
                {places.length} {places.length === 1 ? 'Place' : 'Places'}
              </h3>
            </div>
          </Link>
        </Card>
      </li>
    );
}
