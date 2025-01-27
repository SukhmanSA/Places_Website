import React from 'react'
import UserItem from './UserItem'
import "./UsersList.css"
import Card from '../../shared/components/UIElements/Card'

export default function UsersList({items}) {

    if(items.length === 0){
        return <div className='center'>
            <Card>
            <h2>No users found.</h2>
            </Card>
        </div>
    }

    return <ul className='users-list'>
        {items.map((user)=>(
            <UserItem key={user.id} user={user}/>
        ))}
    </ul>
}
