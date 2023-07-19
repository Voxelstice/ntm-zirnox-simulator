const zirnoxCanvas = document.getElementById("zirnox")

// A couple of functions
function quickMath(val, mult, div) {
	return Math.min(Math.ceil( val * mult / div ), mult)
}
function fillArray(array, amount) {
    var fakeArray = array
    for (let i = 0; i < amount; i++) {
        fakeArray[i] = null
    }
    return fakeArray
}
function findConstructor(array, name) {
    var constructor
    array.forEach(ah => {
        var thing = new ah()
        if (thing.constructor.name == name) {
            constructor = ah
        }
    })
    return constructor
}
function averageCalc(array) {
    var number = 0
    for (item of array) {
        number += item
    }
    var result = number / array.length
    if (isNaN(result) == true) {
        return 0
    } else {
        return result
    }
}
function checkIfInside(x, y, w, h, text) {
    var rect = zirnox.renderer.canvas.canvas.getBoundingClientRect()
    if (mPos[0]-rect.x > x && mPos[1]-rect.y > y && mPos[0]-rect.x < x+w && mPos[1]-rect.y < y+h) {
        tooltip.innerHTML = text
        tooltip.style.visibility = "visible"
    }
}
function checkIfInside2(x, y, w, h) {
    var rect = zirnox.renderer.canvas.canvas.getBoundingClientRect()
    if (mPos[0]-rect.x > x && mPos[1]-rect.y > y && mPos[0]-rect.x < x+w && mPos[1]-rect.y < y+h) {
        return true
    } else {
        return false
    }
}

/// TOOLTIP ///
var mPos = [0,0]
var tooltip = document.createElement('div')
tooltip.innerHTML = 'Hello World'
tooltip.className = "tooltip"
document.body.appendChild(tooltip)

document.body.addEventListener("mousemove", (e) => {
    mPos = [e.clientX, e.clientY]
})

/// BUTTON ///
var updateConfig = true
var btnFuncs = {
    ["new"]: function(btn) {
        var res = prompt(`Are you sure? Type "zirnox" if you are really sure`)
        if (res == "zirnox") {
            zirnox.columns = fillArray([], 24)
        }
    },
    ["run"]: function(btn) {
        if (options.simulating == false) {
            if (btn.innerHTML == "Deactivate") {
                zirnox.stopSimulation()
                btn.innerHTML = "Activate"
            } else {
                zirnox.stopSimulation() // This just resets properties to their defaults, again
                options.simulating = true
                btn.innerHTML = "Deactivate"
            }
        } else if (options.simulating == true) {
            options.simulating = false
            zirnox.stopSimulation()
            btn.innerHTML = "Activate"
        }
    },
    ["changelog"]: function(btn) {
        document.getElementById('changelog').className = 'changelog'
    },
    ["carbonDioxide"]: function() {
        var res = prompt("Carbon dioxide to be in the reactor")
        var num = Number.parseInt(res)
        if (num < 0) {
            num = 0
        }
        if (num > zirnox.carbonDioxideMax) {
            num = zirnox.carbonDioxideMax
        }
        if (isNaN(num) == true) {
            num = 0
        }

        zirnox.carbonDioxide = num
        updateConfig = true
    },
    ["boilerInputRate"]: function() {
        var res = prompt("Water input rate")
        var num = Number.parseInt(res)
        if (num < 0) {
            num = 0
        }
        if (num > 16000) {
            num = 16000
        }
        if (isNaN(num) == true) {
            num = 0
        }

        options.zirnoxStuff.boilerInputRate = num
        updateConfig = true
    },
    ["boilerOutputRate"]: function() {
        var res = prompt("Steam output rate")
        var num = Number.parseInt(res)
        if (num < 0) {
            num = 0
        }
        if (num > 16000) {
            num = 16000
        }
        if (isNaN(num) == true) {
            num = 0
        }

        options.zirnoxStuff.boilerOutputRate = num
        updateConfig = true
    },
    ["export"]: function() {
        window.open("https://github.com/Voxelstice/ntm-zirnox-simulator/issues/1")
        return //alert("Check back later.")
        if (options.simulating == true) {
            return alert("You can't export while simulating")
        }
        var json = {"version": "rbmk_2", "data": [], "rbmk": {"rbmkdials": {}, "boilerInputRate": 0, "boilerOutputRate": 0, "width": 15, "height": 15}}

        var index = 0
        rbmk.columns.forEach(column => {
            json.data.push({"class": column != null ? column.constructor.name.toLowerCase() : null, "variables": {}})

            for (const property in column) {
                if (typeof(column[property]) != "object") {
                    json.data[index].variables[property] = column[property]
                } else if (typeof(column[property]) == "object") {
                    if (property == "fuel") {
                        json.data[index].variables[property] = {"construct": column[property].constructor.name}
                    }
                }
            }

            index += 1
        })

        json.rbmk.boilerInputRate = options.rbmkStuff.boilerInputRate
        json.rbmk.boilerOutputRate = options.rbmkStuff.boilerOutputRate
        for (const property in RBMKDials) {
            json.rbmk.rbmkdials[property] = RBMKDials[property]
        }

        try {
            navigator.clipboard.writeText(JSON.stringify(json))
            alert("Export successful")
        } catch (err) {
            alert(err)
        }
    },
    ["import"]: function() {
        window.open("https://github.com/Voxelstice/ntm-zirnox-simulator/issues/1")
        return //alert("Check back later.")
        if (options.simulating == true) {
            return alert("You can't import while simulating")
        }
        var res = prompt("Enter json data")
        try {
            var json = JSON.parse(res)
            var rbmkColumnData = []
    
            if (!json.version) {
                alert("This data doesn't contain version")
                return
            }
            if (!json.data) {
                alert("This data doesn't contain any data")
                return
            }
    
            if (json.version != "rbmk_2") {
                alert(`This data is not up-to-date (${json.version}), expect some issues`)
            }
    
            var index = 0
            json.data.forEach(element => {
                rbmkColumnData[index] = getConstructor(element.class)

                for (const property in element.variables) {
                    if (element.variables[property].construct) {
                        var ah = findConstructor(fuels, element.variables[property].construct)
                        rbmkColumnData[index][property] = new ah()
                    } else {
                        rbmkColumnData[index][property] = element.variables[property]
                    }
                }
    
                index += 1
            })

            options.rbmkStuff.boilerInputRate = json.rbmk.boilerInputRate
            options.rbmkStuff.boilerOutputRate = json.rbmk.boilerOutputRate
            for (const property in json.rbmk.rbmkdials) {
                RBMKDials[property] = json.rbmk.rbmkdials[property]
            }
    
            rbmk.width = json.rbmk.width || 15
            rbmk.height = json.rbmk.height || 15
            rbmk.columns = fillArray([], rbmk.width*rbmk.height)
            rbmk.columns = rbmkColumnData

            rbmk.updateCanvasSize()
        } catch (err) {
            alert(`Error occurred: ${err}`)
            console.trace(err)
        }
    },
    ["reactorfill"]: function(btn) {
        options.fillZirnox = !options.fillZirnox
        btn.innerHTML = `Fill (${options.fillZirnox})`
    }
}

function button() {
    var btn = document.elementFromPoint(mPos[0], mPos[1])
    if (btnFuncs[btn.getAttribute("action")]) {
        btnFuncs[btn.getAttribute("action")](btn)
    }
}

// Main script
var options = {
    // ZIRNOX itself
    simulating: false,
    frames: 0,

    zirnoxStuff: {
        boilerInputRate: 0,
        boilerOutputRate: 0
    },

    rodSelected: -1,
    fillZirnox: false
}
var configMenu = document.getElementById("config_main")
var renderer = new Renderer(zirnoxCanvas)
var zirnox = new ZIRNOX(renderer, fillArray([], 24))

// Loop
setInterval(() => {
    tooltip.style.visibility = "hidden"
    tooltip.style.left = (mPos[0]+15) + "px"
    tooltip.style.top = mPos[1] + window.scrollY + "px"

    var hoveringOn = document.elementFromPoint(mPos[0], mPos[1])
    if (hoveringOn) {
        if (hoveringOn.getAttribute("tooltip")) {
            tooltip.innerHTML = hoveringOn.getAttribute("tooltip")
            tooltip.style.visibility = "visible"
        }
    }

    // ZIRNOX
    if (options.simulating == true) {
        options.frames++
        zirnox.update(options.frames)
    } else {
        zirnox.editColumns = zirnox.columns
    }
    zirnox.draw(options.frames)

    // Config
    if (updateConfig == true) {
        updateConfig = false

        configMenu.innerHTML = ""

        var elementt = document.createElement("button")
        elementt.className = "textButton"
        elementt.style.fontSize = "27px"
        elementt.innerHTML = `Carbon dioxide: ${zirnox.carbonDioxide}`
        elementt.setAttribute("action", "carbonDioxide")
        elementt.setAttribute("onclick", `button()`)

        configMenu.insertAdjacentElement("beforeend", elementt)

        var elementt = document.createElement("button")
        elementt.className = "textButton"
        elementt.style.fontSize = "27px"
        elementt.innerHTML = `Water input rate: ${options.zirnoxStuff.boilerInputRate}`
        elementt.setAttribute("action", "boilerInputRate")
        elementt.setAttribute("onclick", `button()`)

        configMenu.insertAdjacentElement("beforeend", elementt)

        var elementt = document.createElement("button")
        elementt.className = "textButton"
        elementt.style.fontSize = "27px"
        elementt.innerHTML = `Steam output rate: ${options.zirnoxStuff.boilerOutputRate}`
        elementt.setAttribute("action", "boilerOutputRate")
        elementt.setAttribute("onclick", `button()`)

        configMenu.insertAdjacentElement("beforeend", elementt)
    }

    // Display buttons when simulating
    var btns = document.getElementsByClassName("showInDesign")
    for (let i = 0; i < btns.length; i++) {
        const btn = btns[i]
        btn.style.display = options.simulating ? "none" : "unset"
    }
}, 20)

// Main placement system
function clamp(val, a, b) {
    if (val >= b) {
        return b
    } else if (val <= a) {
        return a
    } else {
        return val
    }
}

document.body.addEventListener("click", function() {
    if (checkIfInside2(144*3, 35*3, 14*3, 14*3) == true) {
        zirnox.stopSimulation()
        options.simulating = !options.simulating
        zirnox.buttonSound.volume = 0.4
        zirnox.buttonSound.pause()
        zirnox.buttonSound.currentTime = 0
        zirnox.buttonSound.play()
    }

    if (checkIfInside2(154*3, 54*3, 30*3, 30*3) == true) {
        zirnox.venting = !zirnox.venting
        zirnox.buttonSound.volume = 0.4
        zirnox.buttonSound.pause()
        zirnox.buttonSound.currentTime = 0
        zirnox.buttonSound.play()
    }

    zirnox.processClick()
})

// This just puts a list of rods
function fuelClick() {
    var btn = document.elementFromPoint(mPos[0], mPos[1])
    if (options.fillZirnox == true) {
        for (let index = 0; index < zirnox.columns.length; index++) {
            zirnox.columns[index] = new fuels[btn.getAttribute("fuelname")]
        }
    } else {
        zirnox.columns[options.rodSelected] = new fuels[btn.getAttribute("fuelname")]
    }
    options.rodSelected = -1
}
var index = 0
fuels.forEach(fuel => {
    var test = new fuel()
    var element = document.createElement("img")
    element.src = test.texture
    element.style.width = "32px"
    element.style.height = "32px"
    element.style.imageRendering = "pixelated"

    var toptext = `<p style="color: green; margin: 0px;">[ZIRNOX Fuel Rod]</p><p style="color: yellow; margin: 0px;">Generates ${test.heat} heat per tick</p>`
    if (test.breeding == true) {
        toptext = `<p style="color: darkgreen; margin: 0px;">[ZIRNOX Breeding Rod]</p><p style="color: yellow; margin: 0px;">Place next to fuel rods to breed</p>`
    }

    element.setAttribute("onclick", "fuelClick()")
    element.setAttribute("fuelname", index)
    if (test.name == "Empty ZIRNOX Rod") {
        element.setAttribute("tooltip", `<b>${test.name}</b><p style="color: grey; margin: 0px;"><i>Why would you put this in the reactor?</i></p>`)
    } else {
        element.setAttribute("tooltip", `<b>${test.name}</b>${toptext}<p style="color: yellow; margin: 0px;">Lasts ${test.maxLife} ticks</p>`)
    }
    document.getElementById("fuels").appendChild(element)
    index++
})