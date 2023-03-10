//console.log("hello world")

/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */

//myFetch doesnt work
function myFetch(url, cb, method) {
    const xhr = new XMLHttpRequest();
    xhr.open(method || "GET", url);
    xhr.responseType = "json";
    xhr.onload = function () {
        cb(xhr.response);
    };
    xhr.onerror = function () {
      console.log("error");
    };
    xhr.send();
 }


const APIs = (() => {
    const createTodo = (newTodo) => {
        return fetch("http://localhost:3000/todos", {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const deleteTodo = (id) => {
        return fetch("http://localhost:3000/todos/" + id, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const getTodos = () => {
        return fetch("http://localhost:3000/todos").then((res) => res.json());
    };

    const changeTodos = (todo) => {
        return fetch("http://localhost:3000/todos/" + todo.id, {
            method: "PUT",
            body: JSON.stringify(todo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    }

    return { createTodo, deleteTodo, getTodos, changeTodos };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order


*/
const Model = (() => {
    class State {
        #todos; //private field
        #onChange; //function, will be called when setter function todos is called
        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        set todos(newTodos) {
            // reassign value
            console.log("setter function");
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo, changeTodos } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
        changeTodos
    };
})();
/* 
    todos = [
        {
            id:1,
            content:"eat lunch"
        },
        {
            id:2,
            content:"eat breakfast"
        }
    ]

*/
const View = (() => {
    const todolistEl = document.querySelector(".todo-list");
    const completelistEl = document.querySelector(".complete-list");
    const submitBtnEl = document.querySelector(".submit-btn");
    const editBtnEl = document.querySelector(".edit-btn");
    const inputEl = document.querySelector(".input");

    const renderTodos = (todos) => {
        let todosTemplate = "";
        let completeTemplate = ""
        todos.forEach((todo) => {
            if (todo.pending) {
                const liTemplate = `<li><input type="text" id="text" class="text${todo.id}" disabled value=${todo.content} />
                                    <button class="edit-btn" id="${todo.id}">edit</button>
                                    <button class="delete-btn" id="${todo.id}">delete</button>
                                    <button class="change-btn" id="${todo.id}"">change</button></li>`;
                todosTemplate += liTemplate;
            } else {
                const liTemplate = `<li><button class="change-btn" id="${todo.id}"">change</button>
                    <input type="text" id="text" class="text${todo.id}" disabled value=${todo.content} />
                    <button class="edit-btn" id="${todo.id}">edit</button>
                    <button class="delete-btn" id="${todo.id}">delete</button></li>`;
                completeTemplate += liTemplate;
            }
        });
        if (todosTemplate === "") {
            todosTemplate = "<h4>no task to display!</h4>";
        }
        if (completeTemplate === "") {
            completeTemplate = "<h4>no task to display!</h4>";
        }
        todolistEl.innerHTML = todosTemplate;
        completelistEl.innerHTML = completeTemplate;
    };

    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, submitBtnEl, editBtnEl, inputEl, clearInput, todolistEl, completelistEl };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                1. read the value from input
                2. post request
                3. update view
            */
            const inputValue = view.inputEl.value;
            model.createTodo({ content: inputValue, pending: true }).then((data) => {
                state.todos = [data, ...state.todos];
                view.clearInput();
            });
        });
    };

    //will need to handleDelete and change on both todolistEl and completelistEl

    const handleDelete = () => {
        //event bubbling
        /* 
            1. get id
            2. make delete request
            3. update view, remove
        */
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                console.log("id", typeof id);
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });

        view.completelistEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                console.log("id", typeof id);
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const handleChange = () => {
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "change-btn") {
                let id = event.target.id;
                //console.log(event.target.id)
                //console.log(state.todos)
                const obj = state.todos.find((obj) => { if (obj.id == id) { return true } })
                //console.log(obj)
                obj.pending = !obj.pending
                model.changeTodos(obj).then((data) => { state.todos = state.todos })
            } else if (event.target.className === "edit-submit-btn") {
                let id = event.target.id;
                const obj = state.todos.find((obj) => { if (obj.id == id) { return true } })
                obj.content = document.querySelector(`.text${id}`).value;
                model.changeTodos(obj).then((data) => { state.todos = state.todos })
            } else if (event.target.className === "edit-btn") {
                let id = event.target.id;
                let input = document.querySelector(`.text${id}`);
                let btn = event.target
                input.disabled = false;
                btn.setAttribute("class", "edit-submit-btn")
            }


        });

        view.completelistEl.addEventListener("click", (event) => {
            if (event.target.className === "change-btn") {
                let id = event.target.id;
                const obj = state.todos.find((obj) => { if (obj.id == id) { return true } })
                obj.pending = !obj.pending
                model.changeTodos(obj).then((data) => { state.todos = state.todos })
            } else if (event.target.className === "edit-submit-btn") {
                let id = event.target.id;

                const obj = state.todos.find((obj) => { if (obj.id == id) { return true } })

                obj.content = document.querySelector(`.text${id}`).value;
                model.changeTodos(obj).then((data) => { state.todos = state.todos })
            } else if (event.target.className === "edit-btn") {
                let id = event.target.id;
                let input = document.querySelector(`.text${id}`);
                let btn = event.target
                input.disabled = false;
                btn.setAttribute("class", "edit-submit-btn")
            }
        });
    };

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        handleChange();
        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
