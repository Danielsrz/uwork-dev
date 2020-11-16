import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CardActions, Button, makeStyles } from '@material-ui/core'
import * as MateriasService from '../../services/MateriasService'

const useStyles = makeStyles((theme) => ({
    textMateria: {
        fontSize: '1.4rem',
        fontStyle: 'bold',
        color: '#FFFFFF'
    },
    cardContent: {
        marginTop: theme.spacing(2),
        background: 'linear-gradient(45deg, #8f34a4 15%, #a53493)'
        //bc3480
    },
    carrera: {
        marginBottom: 0,
        color: '#FFFFFF'
    },
    button: {
        color: '#FFF',
        borderColor: '#FFF',
    }

}))

const CardSubject = (props) => {

    const classes = useStyles()
    const { data, history } = props
    const materiaId = data.materiaId;
    const [admin, setAdmin] = useState(false)

    useEffect(() => {
        const verificarAdmin = async () => {
            const isAdmin = await MateriasService.verifyAdmin(materiaId)
            setAdmin(isAdmin)
        }
        verificarAdmin()
    }, [materiaId])


    return (
        <div>
            <Card className={classes.cardContent} key={data.materiaId}>
                <CardContent>
                    <Typography className={classes.textMateria} variant="h5" component="h2">
                        {data.nombre}
                    </Typography>
                    <Typography className={classes.carrera}>
                        {data.carrera}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button variant="outlined" size="small" className={classes.button} onClick={ ()=> { history.push(`/subject/${materiaId}`) }}>INGRESAR</Button>
                    {admin ? 
                    <Button size="small" className={classes.button}  onClick={() => { props.deleteHandler(data.materiaId) }}>ELIMINAR</Button>
                    : <Button size="small" className={classes.button}  onClick={() => { props.exitHandler(data.materiaId) }}>SALIR</Button>
                    }              
                </CardActions>
            </Card>
        </div>
    )
}

export default CardSubject;

