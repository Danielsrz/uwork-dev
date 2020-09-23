import React, { useContext } from 'react'; 
import { Route, Redirect } from 'react-router-dom'
import { AuthContext } from '../context/auth';


const GuardRoute = (props) => {

    const { type, ...rest} = props;
    const { isLoggedIn } = useContext(AuthContext)

    if( type === 'private' && !isLoggedIn ){
        return <Redirect to="/login" />;
    }else if ( type === 'public' && isLoggedIn ){
        return <Redirect to="/dashboard" />;
    }

   return (
       <Route {...rest} />
   );
}
 

export default GuardRoute;