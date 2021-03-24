const dataBase = firebase.firestore()
const taskForm = document.querySelector('#task-form')
const tasksContainer = document.querySelector('#tasks-container')
const textEditPositive = document.querySelector('.positive')
const textEditNegative = document.querySelector('.negative')
const textEditTotal = document.querySelector('.total')
let positive = 0
let negative = 0
let toModify = false
let id = ''

function saveTask(title, amount) {
    if(title != '' && amount != ''){
        positive = 0
        negative = 0
        dataBase.collection('tasks').doc().set({
            titulo: title,
            importe: amount,
        })
    }
}

const getTasks = () => dataBase.collection('tasks').get()

const deleteTask = (id) => dataBase.collection('tasks').doc(id).delete()

const updateTask = (id, task) => dataBase.collection('tasks').doc(id).update(task)

const getTask = (id) => dataBase.collection('tasks').doc(id).get()

const onGetTask = (callback) => dataBase.collection('tasks').onSnapshot(callback)

window.addEventListener('DOMContentLoaded', async (e) => {
    onGetTask( (querySnapshot) => {
        tasksContainer.innerHTML= ``
        querySnapshot.forEach( item => {
            const task = item.data()
            task.id = item.id
            tasksContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
                <h3 class="h5">${task.titulo}</h3>
                <p>${task.importe}</p>
                <div>
                    <button class="btn btn-primary btn-sm btn-edit" data-id="${task.id}">Editar</button>
                    <button class="btn btn-danger btn-sm btn-delete" data-id="${task.id}">Eliminar</button>
                </div>
            </div>`
            const btnsDelete = document.querySelectorAll('.btn-delete')
            btnsDelete.forEach( btn =>{
                btn.addEventListener('click', async (e) =>{
                    positive = 0
                    negative = 0
                    await deleteTask(e.target.dataset.id)
                })
            })
            const btnsEdit = document.querySelectorAll('.btn-edit')
            btnsEdit.forEach( btn => {
                btn.addEventListener('click', async (e) =>{
                    positive = 0
                    negative = 0
                    const task = await getTask(e.target.dataset.id)
                    toModify = true
                    id = e.target.dataset.id
                    taskForm['task-title'].value = task.data().titulo
                    taskForm['task-amount'].value = task.data().importe
                    taskForm['btn-task-form'].innerText = 'Modificar'
                })
            })
            const btnsDeleteAll = document.getElementById('btn-delete-all')
            btnsDeleteAll.addEventListener('click', async (e) =>{
                btnsDelete.forEach( async btn =>{
                    await deleteTask(task.id)
                    positive = 0
                    negative = 0
                })
            })
            if (task.importe > 0){
                positive += parseInt(task.importe)
            } else {
                negative += parseInt(task.importe)
            }
        })

    })
})

const btnsRefresh = document.querySelector('.btn-reload')
btnsRefresh.addEventListener('click', e => {
    textEditPositive.textContent = positive
    textEditNegative.textContent = negative
    textEditTotal.textContent = positive + negative
})

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const title = taskForm['task-title']
    const amount = taskForm['task-amount'].value
    if (!toModify){
        await saveTask(title.value, amount)
    } else{
        if(title.value != '' && amount != ''){
            await updateTask(id, {
                titulo: title.value,
                importe: amount,
            })
        }
        toModify = false
        taskForm['btn-task-form'].innerText = 'Guardar'
    }
    await getTasks()
    taskForm.reset()
    title.focus()
})