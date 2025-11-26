import {Octokit, App} from "https://esm.sh/octokit";

async function fetchRepo(repo,apiKey) {
    if (apiKey) {
        // Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
        const octokit = new Octokit({auth: apiKey});

        // Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
        const {
            data: {login},
        } = await octokit.rest.users.getAuthenticated();

        // https://docs.github.com/en/rest/reference/issues#create-an-issue
        const apiRepo = await octokit.request("GET /repos/"+login+"/"+repo+"/commits", {
            username: login,
            api_key: apiKey,
        });

        document.getElementById("button").onclick = () => {
            ghFetchTime(JSON.stringify(apiRepo), repo);
        }
        document.getElementById("button").disabled = false;
    } else {
        const octokit = new Octokit();
        const login = document.getElementById("user").value;

        const apiRepo = await octokit.request("GET /repos/"+login+"/"+repo+"/commits", {
            username: login,
        });

        document.getElementById("button").onclick = () => {
            ghFetchTime(JSON.stringify(apiRepo), repo);
        }
        document.getElementById("button").disabled = false;
    }
}

const loadingStrs = ["Loading   ","Loading.  ","Loading.. ","Loading..."];
let loadingInt = 0;
let loadingInterval = undefined;
function loadingTextAnim() {
    document.getElementById("repo").innerHTML = "<option value=\"\">"+loadingStrs[loadingInt]+"</option>";
    loadingInt++;
    if (loadingInt > loadingStrs.length-1) {
        loadingInt = 0;
    }
}

let apiRepos;
async function fetchRepos(apiKey) {
    document.getElementById("repo").innerHTML = "<option value=\"\">Loading   </option>";
    loadingInterval = window.setInterval(loadingTextAnim, 200);

    if (apiKey) {
        const octokit = new Octokit({auth: apiKey});

        const {
            data: {login},
        } = await octokit.rest.users.getAuthenticated();

        try {
            apiRepos = await octokit.request("GET /search/repositories?q=user:" + login, {
                username: login,
                api_key: apiKey,
            });

            document.getElementById("repo").innerHTML = "<option value=\"\">-Select a repo-</option>";
        } catch (error) {
            console.log(error.message);
            document.getElementById("repo").innerHTML = "<option value=\"\">ERROR: "+error.message+"</option>";
        }
    } else {
        const octokit = new Octokit();
        const login = document.getElementById("user").value;

        try {
            apiRepos = await octokit.request("GET /search/repositories?q=user:"+login, {
                username: login
            });

            document.getElementById("repo").innerHTML = "<option value=\"\">-Select a repo-</option>";
        } catch (error) {
            console.log(error.message.split("message\":\"")[1].spli);
            document.getElementById("repo").innerHTML = "<option value=\"\">ERROR: "+error.message+"</option>";
        }
    }
    window.clearInterval(loadingInterval);
    for (let i = 0; i < apiRepos.data.items.length; i++) {
        let el = document.createElement("option");
        el.innerHTML = apiRepos.data.items[i].name;
        el.value = apiRepos.data.items[i].name;
        document.getElementById("repo").appendChild(el);
    }

    document.getElementById("repo").oninput = (e) => {
        if (e.target.value != "") {
            if (apiKey) {
                fetchRepo(e.target.value, apiKey);
            } else {
                fetchRepo(e.target.value);
            }
        }
    }
}

document.getElementById("user").onblur = () => {
    window.localStorage.setItem("userSave", document.getElementById("user").value);
    userBlur();
}

function userBlur() {
    if (loadingInterval != undefined) {
        window.clearInterval(loadingInterval);
    }

    if (document.getElementById("user").value.length > 39) {
        fetchRepos(document.getElementById("user").value);
    } else {
        fetch("api_key.txt")
            .then( r => {
                if(r.ok) {
                    r.text();
                } else {
                    return;
                }
            })
            .then( t => fetchRepos(t))
    }
}

document.body.onload = () => {
    if(window.localStorage.getItem('userSave')) {
        document.getElementById('user').value = window.localStorage.getItem('userSave');
        userBlur();
    }
}