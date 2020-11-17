import React, {useContext, useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types';
import { Grid, IconButton, makeStyles, Paper, AppBar, Tabs, Tab, Box } from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PostAddIcon from '@material-ui/icons/PostAdd';
import Invite from './Invite';
import { SubjectContext } from '../../context/subject';
import * as MateriasService from '../../services/MateriasService'
import * as TaskService from '../../services/TaskService'
import CustomizedSnackbars from '../CustomSnackBar/CustomSnackBar'
import CardTask from '../Task/CardTask';
import Task from '../Task/Task';
import moment from 'moment'
import AlertTaskDialog from './AlertTaskDialog';

const useStyles = makeStyles((theme) => ({   
    floatingButtons: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'fixed',
        right: 0,
        bottom: 0,
        marginRight: 8,
        marginBottom: 8
    },
    floatingButtonAddTask: {
        color: 'white',
        backgroundColor: theme.palette.success.main
    },
    floatingButtonInvite: {
        color: 'white',
        marginBottom: '8px',
        backgroundColor: theme.palette.primary.dark
    },
    info: {
        margin: '5px 5px 5px 5px',
        padding: '5px 5px 5px 10px',
        fontSize: '0.6rem',
        fontWeight: 'bold',
        backgroundColor: '#F5F5F5',
    },
    container: {
        marginTop: '5px',
        padding: '10px',

    },
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    sizeSmallPadding: {
        padding: 8
    },
    appbar: {
    }
}));


function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
            <Box p={2}>
                {children}
            </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const Subject = (props) => {
    const classes = useStyles();
    const { materiaId } = useParams();
    const { setSubjectId, setSubjectName } = useContext(SubjectContext)
    const [link, setLink] = useState('')
    const [openInvite, setOpenInvite] = useState(false);
    const [openTask, setOpenTask] = useState(false);
    const [pendientes, setPendientes] = useState([]);
    const [finalizadas, setFinalizadas] = useState([]);
    const [openAlert, setOpenAlert] = React.useState(false);
    const [tareaId, setTareaId] = useState('')
    const [cantColabs, setCantColabs] = useState(0)
    const [value, setValue] = React.useState(0);

    const [openSuccessBar, setOpenSuccessBar] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        async function setSubjectData() {
            const materia = await MateriasService.getSubjectById(materiaId)
            setLink(materia.link)
            setSubjectName(materia.nombre)
            setSubjectId(materiaId)
        }
        async function cargarTareas() {
            let tasksSubject = [];
            tasksSubject = await TaskService.getTasks(materiaId)
            tasksSubject.forEach( (task) => {
                if(task.estado === 'pendiente'){
                    setPendientes(prevState =>
                        [...prevState, task]
                    )
                }else if(task.estado === 'finalizada'){
                    setFinalizadas(prevState =>
                        [...prevState, task]
                    )
                }
            })
        }
        cargarTareas();
        setSubjectData();
    }, [materiaId, setSubjectId, setSubjectName])

    const handleChange = (event, newValue) => {
        setValue(newValue);
    }

    const handleClickOpenInvite = () => {
        setOpenInvite(true);
    }

    const handleClickOpenTask = async () => {
        if (openTask) {
            await setOpenTask(false)
        }
        setOpenTask(true);
    }

    const handleCloseSnackBarSuccess = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSuccessBar(false);
    }

    const acceptDelete = (taskId, materiaId) => {
        TaskService.deleteTask(taskId, materiaId)
        .then(() => {
            setPendientes(prevState => prevState.filter(e => e.tareaId !== taskId))
        })
        .catch((e) => { console.log(e) })
    }

    const handleDelete = (taskId, colaboradores) => {
        setTareaId(taskId)
        setCantColabs(colaboradores)
        setOpenAlert(true)
    }

    const handleFinished = (tareaId, subjectId) => {
        TaskService.finishedTask(tareaId, subjectId)
            .then(() => {
                let tareaPendiente = pendientes.filter(e => e.tareaId === tareaId)
                tareaPendiente[0].estado = 'finalizada';
                setPendientes(prevState => prevState.filter(e => e.tareaId !== tareaId))
                setFinalizadas(prevState =>
                    [...prevState, tareaPendiente[0]]
                )
                setMessage('La tarea se ha cambiado a la lista de tareas finalizadas.')
                setOpenSuccessBar(true)
            }).catch((e) => {
                console.log(e)
            })
    }

    const handlePendiente = (tareaId, subjectId) => {
        TaskService.pendienteTask(tareaId, subjectId)
            .then(() => {
                let tareaFinalizada = finalizadas.filter(e => e.tareaId === tareaId)
                tareaFinalizada[0].estado = 'pendiente';
                setFinalizadas(prevState => prevState.filter(e => e.tareaId !== tareaId))
                setPendientes(prevState =>
                    [...prevState, tareaFinalizada[0]]
                )
                setMessage('La tarea se ha cambiado a la lista de tareas pendiente.')
                setOpenSuccessBar(true)
            }).catch((e) => {
                console.log(e)
            })
    }

    const createTask = (task, isEdition, index) => {
        if (!isEdition) {
            TaskService.createTask(task, materiaId)
                .then(async (doc) => {
                    let task = await doc.get()
                    task = task.data()
                    setPendientes(prevState =>
                        [...prevState, { tareaId: doc.id, titulo: task.titulo, descripcion: task.descripcion, colaboradores: task.colaboradores, fechaLimite: moment(task.fechaLimite.toDate()).format('L'), estado: task.estado }]
                    )
                }).catch( (e) => {
                    console.log(e)
                })
        } else {
            TaskService.updateTask(task.tareaId, task)
                .then(() => {
                    if (index !== undefined) {
                        const newPendientes = pendientes.slice() //copy the array
                        newPendientes[index] = { tareaId: task.tareaId, titulo: task.titulo, descripcion: task.descripcion, colaboradores: task.aCargo, fechaLimite: moment(task.fechaLimite).format('L'), estado: task.estado } //execute the manipulations
                        setPendientes(newPendientes)
                    }
                })
                .catch(e => console.log(e))
        }
    }

    const onSuccessInvitation = () => {
        setMessage('Invitación enviada!')
        setOpenSuccessBar(true)
    }

    return (
        <>
            {openInvite && <Invite 
                open={openInvite}
                setOpen={setOpenInvite}
                materiaId={materiaId}
                successHandler={onSuccessInvitation}
            />}
            {openTask && <Task
                open={openTask}
                setOpen={setOpenTask}
                acceptHandler={createTask}
            />}
            {openAlert && <AlertTaskDialog
                open={openAlert}
                setOpen={setOpenAlert}
                taskId={tareaId}
                subjectId={materiaId}
                cantColaboradores={cantColabs}
                acceptHandler={acceptDelete}
            />}
                <Paper xs={12} sm={6} md={4} className={classes.info} variant="outlined" >
                    <p>Link al foro donde podés encontrar apuntes, examenes, trabajos practicos y más información de la materia <a href={link} rel="noopener noreferrer" target="_blank">{link}</a></p>
                </Paper>    
                    <AppBar position="static" className={classes.appbar}>
                        <Tabs value={value} onChange={handleChange} variant="fullWidth" aria-label="simple tabs example">
                        <Tab label="Tareas pendientes" {...a11yProps(0)} />
                        <Tab label="Tareas finalizadas" {...a11yProps(1)} />
                        </Tabs>
                    </AppBar>
                    <TabPanel value={value} index={0}>
                    <Grid container spacing={1}>
                        {pendientes && pendientes.map((task, index) =>
                            <Grid item xs={12} sm={6} md={4}  key={task.tareaId}>
                                <CardTask data={task} history={props.history} acceptTaskHandler={createTask} deleteHandler={handleDelete} finishedHandler={handleFinished} index={index}/>
                            </Grid>
                            )
                        }
                    </Grid>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <Grid container spacing={1}>
                            {finalizadas && finalizadas.map((task, index) =>
                                <Grid item xs={12} sm={6} md={4}  key={task.tareaId}>
                                    <CardTask data={task} history={props.history} acceptTaskHandler={createTask} deleteHandler={handleDelete} pendienteHandler={handlePendiente} index={index}/>
                                </Grid>
                                )
                            }
                        </Grid>
                    </TabPanel>
            <div className={classes.floatingButtons}>
            <IconButton
                className={classes.floatingButtonInvite}
                arial-label="Agregar colaborador"
                onClick={handleClickOpenInvite}
                size="small"
                classes={{
                    sizeSmall: classes.sizeSmallPadding
                }}
            >
                <PersonAddIcon style={{ fontSize: "24px" }} />
            </IconButton>
            <IconButton variant="contained"
                    className={classes.floatingButtonAddTask}
                    onClick={handleClickOpenTask}>
                    <PostAddIcon style={{ fontSize: "28px" }} />
            </IconButton>
            </div>
            <CustomizedSnackbars open={openSuccessBar} handleClose={handleCloseSnackBarSuccess} severity="success">
                {message}
            </CustomizedSnackbars>
        </>      
    );
}

export default Subject;
