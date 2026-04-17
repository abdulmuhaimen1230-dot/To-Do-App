        /* --- JAVASCRIPT LOGIC --- */

        // 1. Firebase Configuration
        var firebaseConfig = {
            apiKey: "AIzaSyAMHg5vYX02rXq7JDDeomeBdk_z-T7Fbzw",
            authDomain: "to-do-app-11376.firebaseapp.com",
            databaseURL: "https://to-do-app-11376-default-rtdb.firebaseio.com",
            projectId: "to-do-app-11376",
            storageBucket: "to-do-app-11376.firebasestorage.app",
            messagingSenderId: "482400109287",
            appId: "1:482400109287:web:69ddee256eb2d3d9ccd842"
        };

        // 2. Initialize Firebase (v8)
        firebase.initializeApp(firebaseConfig);
        var auth = firebase.auth();
        var db = firebase.database();

        // 3. Signup Functionality
        window.handleSignup = function() {
            var name = document.getElementById("name").value;
            var email = document.getElementById("email").value;
            var pass = document.getElementById("password").value;

            if (!name || !email || !pass) {
                alert("All fields are required!");
                return;
            }

            auth.createUserWithEmailAndPassword(email, pass)
                .then(function(res) {
                    db.ref('users/' + res.user.uid).set({ username: name });
                })
                .catch(function(err) { alert(err.message); });
        };

        // 4. Logout Functionality
        window.handleLogout = function() {
            auth.signOut();
        };

        // 5. Auth State Observer
        auth.onAuthStateChanged(function(user) {
            var authPanel = document.getElementById("auth-panel");
            var todoPanel = document.getElementById("todo-panel");
            var userDisplay = document.getElementById("user-display");

            if (user) {
                authPanel.style.display = "none";
                todoPanel.style.display = "block";
                
                db.ref('users/' + user.uid).once('value').then(function(snap) {
                    if(snap.val()) userDisplay.innerText = "Hi, " + snap.val().username;
                });

                fetchTasks(user.uid);
            } else {
                authPanel.style.display = "block";
                todoPanel.style.display = "none";
            }
        });

        // 6. Add Task Logic
        window.addTask = function() {
            var taskInput = document.getElementById("todo-input");
            var user = auth.currentUser;

            if (taskInput.value.trim() !== "" && user) {
                db.ref('todos/' + user.uid).push({ text: taskInput.value });
                taskInput.value = "";
            }
        };

        // 7. Real-time Fetch
        function fetchTasks(uid) {
            db.ref('todos/' + uid).on('value', function(snapshot) {
                var listArea = document.getElementById("list-area");
                listArea.innerHTML = "";
                var data = snapshot.val();
                for (var key in data) {
                    renderItem(data[key].text, key, uid);
                }
            });
        }

        // 8. Dynamic Item Rendering
        function renderItem(text, id, uid) {
            var listArea = document.getElementById("list-area");
            var li = document.createElement("li");
            li.className = "todo-item";
            li.innerHTML = "<span>" + text + "</span>" + 
                           "<button class='delete-btn' onclick='deleteTask(\"" + id + "\", \"" + uid + "\")'>Delete</button>";
            listArea.appendChild(li);
        }

        // 9. Delete Task
        window.deleteTask = function(id, uid) {
            db.ref('todos/' + uid + '/' + id).remove();
        };
