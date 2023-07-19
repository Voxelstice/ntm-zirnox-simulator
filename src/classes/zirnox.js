// Don't complain about this, had to get the stupid mess that is my code done
var zirnoxItemOrder = {
    ["10"]: 0,
    ["30"]: 1,
    ["50"]: 2,

    ["01"]: 3,
    ["21"]: 4,
    ["41"]: 5,
    ["61"]: 6,

    ["12"]: 7,
    ["32"]: 8,
    ["52"]: 9,

    ["03"]: 10,
    ["23"]: 11,
    ["43"]: 12,
    ["63"]: 13,

    ["14"]: 14,
    ["34"]: 15,
    ["54"]: 16,

    ["05"]: 17,
    ["25"]: 18,
    ["45"]: 19,
    ["65"]: 20,

    ["16"]: 21,
    ["36"]: 22,
    ["56"]: 23,
}

function lerpRGB(color1, color2, t) {
    const r = Math.round((1 - t) * color1.r + t * color2.r)
    const g = Math.round((1 - t) * color1.g + t * color2.g)
    const b = Math.round((1 - t) * color1.b + t * color2.b)
    return {r:r,g:g,b:b}
}

class ZIRNOX
{
    constructor(renderer, columns) {
        this.renderer = renderer
        this.columns = columns // 24 fuels
        this.editColumns = columns

        this.consoleImg = new Image()
        this.consoleImg.src = "assets/gui_zirnox.png"

        this.expSound = new Audio("https://github.com/HbmMods/Hbm-s-Nuclear-Tech-GIT/blob/master/src/main/resources/assets/hbm/sounds/block/rbmk_explosion.ogg?raw=true")
        this.buttonSound = new Audio("https://github.com/HbmMods/Hbm-s-Nuclear-Tech-GIT/blob/master/src/main/resources/assets/hbm/sounds/block/rbmk_az5_cover.ogg?raw=true")

        this.temperature = 0
        this.temperatureMax = 100000
        
        this.pressure = 0
        this.pressureMax = 100000

        this.carbonDioxide = 0
        this.carbonDioxideMax = 16000
        this.venting = false

        this.steam = 0
        this.steamMax = 8000

        this.water = 0
        this.waterMax = 32000

        this.awaitingClick = false
    }

    processClick() {
        if (this.awaitingClick == false) {
            this.awaitingClick = true
        }
    }

    generateSteam() {
		// function of SHS produced per tick
		// (heat - 10256)/100000 * steamFill (max efficiency at 14b) * 25 * 5 (should get rid of any rounding errors)
		if(this.temperature > 10256) {
			var Water = (((this.temperature - 10256) / this.temperatureMax) * Math.min((this.carbonDioxide / 14000), 1) * 25 * 5)
			var Steam = Water * 1
			
			this.water -= Water
			this.steam += Steam
			
			if(this.water < 0)
                this.water = 0

			if(this.steam > this.steamMax)
				this.steam = this.steamMax
		}
    }

    getNeighbouringSlots(id) {
        switch(id) {
            case 0: return [ 1, 7 ];
            case 1: return [ 0, 2, 8 ];
            case 2: return [ 1, 9 ];
            case 3: return [ 4, 10 ];
            case 4: return [ 3, 5, 11 ];
            case 5: return [ 4, 6, 12 ];
            case 6: return [ 5, 13 ];
            case 7: return [ 0, 8, 14 ];
            case 8: return [ 1, 7, 9, 15 ];
            case 9: return [ 2, 8, 16];
            case 10: return [ 3, 11, 17 ];
            case 11: return [ 4, 10, 12, 18 ];
            case 12: return [ 5, 11, 13, 19 ];
            case 13: return [ 6, 12, 20 ];
            case 14: return [ 7, 15, 21 ]; 
            case 15: return [ 8, 14, 16, 22 ];
            case 16: return [ 9, 15, 23 ];
            case 17: return [ 10, 18 ];
            case 18: return [ 11, 17, 19 ];
            case 19: return [ 12, 18, 20 ];
            case 20: return [ 13, 19 ];
            case 21: return [ 14, 22 ];
            case 22: return [ 15, 21, 23 ];
            case 23: return [ 16, 22 ];
            }
    
            return null;
    }

    getNeighbourCount(id) {
		var neighbours = this.getNeighbouringSlots(id)

		if(neighbours == null)
			return 0

		var count = 0

		for(let i = 0; i < neighbours.length; i++)
			if(this.columns[neighbours[i]] != null)
				count++

		return count
	}

    decay(id) {
		var decay = this.getNeighbourCount(id)
        var num = this.columns[id]
		//var num = EnumUtil.grabEnumSafely(EnumZirnoxType.class, slots[id].getItemDamage());

		if(!num.breeding)
			decay++;

		for(let i = 0; i < decay; i++) {
			this.temperature += num.heat
            num.life++;
			
			if(num.life > num.maxLife) {
                this.columns[id] = new NONE() // it has been depleted so now make it disappear from existence.
				//slots[id] = fuelMap.get(new ComparableStack(getStackInSlot(id))).copy()
				break
			}
		}
    }

    update(ticks) {
        if (options.simulating == true) {
            for (let i = 0; i < this.columns.length; i++) {
                if (this.columns[i] != null) {
                    this.decay(i)
                }
            }
        }

        this.water = clamp(this.water + options.zirnoxStuff.boilerInputRate, 0, this.waterMax)
        this.steam = clamp(this.steam - options.zirnoxStuff.boilerOutputRate, 0, this.steamMax)

        if (this.venting == true) {
            this.carbonDioxide = clamp(this.carbonDioxide - 1000, 0, this.carbonDioxideMax)
        }

        this.pressure = (this.carbonDioxide * 2) + this.temperature * ((this.carbonDioxide / this.carbonDioxideMax))

        if(this.temperature > 0 && this.temperature < this.temperatureMax) {
            if(this.water > 0 && this.carbonDioxide > 0 && this.steam < this.steamMax) {
                this.generateSteam()
                this.temperature -= (this.temperature * this.pressure / 1000000)
            } else {
                this.temperature -= 10
            }
        }

        if (this.pressure > this.pressureMax || this.temperature > this.temperatureMax) {
			this.meltdown()
		}
    }

    meltdown() {
        this.expSound.volume = 0.4
        this.expSound.pause()
        this.expSound.currentTime = 0
        this.expSound.play()
        options.simulating = false
        document.getElementById("explosionText").style.visibility = "visible"
    }

    draw(ticks) {
        this.renderer.reset()

        this.renderer.draw("image", {
            img: this.consoleImg,
            crop: true,

            x: 0,
            y: 0,
            w: 203*3,
            h: 166*3,

            sX: 0,
            sY: 0,
            sW: 203,
            sH: 166
        })

        // DRAW DIALS AND GAUGES
        this.renderer.draw("image", { // Carbon dioxide
            img: this.consoleImg,
            crop: true,

            x: 141*3,
            y: 108*3,
            w: 18*3,
            h: 12*3,

            sX: 238,
            sY: 12*Math.floor((this.carbonDioxide * 6) / this.carbonDioxideMax),
            sW: 18,
            sH: 12
        })
        checkIfInside(141*3, 108*3, 18*3, 12*3, `Carbon Dioxide<br>${this.carbonDioxide}/${this.carbonDioxideMax}mB`)

        this.renderer.draw("image", { // Steam
            img: this.consoleImg,
            crop: true,

            x: 160*3,
            y: 108*3,
            w: 18*3,
            h: 12*3,

            sX: 238,
            sY: 12*Math.floor((this.steam * 6) / this.steamMax),
            sW: 18,
            sH: 12
        })
        checkIfInside(160*3, 108*3, 18*3, 12*3, `Super Dense Steam<br>${Math.floor(this.steam)}/${this.steamMax}mB`)

        this.renderer.draw("image", { // Water
            img: this.consoleImg,
            crop: true,

            x: 178*3,
            y: 108*3,
            w: 18*3,
            h: 12*3,

            sX: 238,
            sY: 12*Math.floor((this.water * 6) / this.waterMax),
            sW: 18,
            sH: 12
        })
        checkIfInside(178*3, 108*3, 18*3, 12*3, `Water<br>${Math.floor(this.water)}/${this.waterMax}mB`)

        // dials
        this.renderer.draw("image", { // Temperature
            img: this.consoleImg,
            crop: true,

            x: 160*3,
            y: 33*3,
            w: 18*3,
            h: 17*3,

            sX: 220,
            sY: 18*Math.floor((this.temperature * 12) / this.temperatureMax),
            sW: 18,
            sH: 17
        })
        checkIfInside(160*3, 33*3, 18*3, 17*3, `Temperature<br>${Math.round((this.temperature) * 0.00001 * 780 + 20)}°C`)

        this.renderer.draw("image", { // Pressure
            img: this.consoleImg,
            crop: true,

            x: 178*3,
            y: 33*3,
            w: 18*3,
            h: 17*3,

            sX: 220,
            sY: 18*Math.floor((this.pressure * 12) / this.pressureMax),
            sW: 18,
            sH: 17
        })
        checkIfInside(178*3, 33*3, 18*3, 17*3, `Pressure<br>${Math.round((this.pressure) * 0.00001 * 30)} bar`)

        // DRAW INDICATORS
        if (options.simulating == true) {
            this.renderer.draw("image", {
                img: this.consoleImg,
                crop: true,
    
                x: 142*3,
                y: 15*3,
                w: 18*3,
                h: 18*3,
    
                sX: 220,
                sY: 238,
                sW: 18,
                sH: 18
            })
        }

        var indicator = true
        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                if (indicator == true) {
                    if (options.simulating == true) {
                        this.renderer.draw("image", {
                            img: this.consoleImg,
                            crop: true,

                            x: (7 + (18 * x)) * 3,
                            y: (15 + (18 * y)) * 3,
                            w: 18 * 3,
                            h: 18 * 3,

                            sX: 238,
                            sY: 238,
                            sW: 18,
                            sH: 18
                        })
                    }
                } else if (indicator == false) {
                    var slotNumber = zirnoxItemOrder[`${x}${y}`]

                    if (this.columns[slotNumber] != null) {
                        var rod = this.columns[slotNumber]
                        this.renderer.draw("image", {
                            img: fueltextures[rod.name],
                            crop: true,
                
                            x: (8 + (18 * x)) * 3,
                            y: (16 + (18 * y)) * 3,
                            w: 16 * 3,
                            h: 16 * 3,
                
                            sX: 0,
                            sY: 0,
                            sW: 16,
                            sH: 16
                        })

                        this.renderer.canvas.fillStyle = "rgba(0, 0, 0, 1)"
                        this.renderer.canvas.fillRect((9 + (18 * x)) * 3, (16+13 + (18 * y)) * 3, 14 * 3, 2 * 3)

                        this.renderer.canvas.fillStyle = "rgba(57, 63, 0, 1)"
                        this.renderer.canvas.fillRect((9 + (18 * x)) * 3, (16+13 + (18 * y)) * 3, 13 * 3, 1 * 3)

                        var rgb = {r:0,g:255,b:0}
                        rgb = lerpRGB({r:0,g:255,b:0}, {r:255,g:0,b:0}, rod.life/rod.maxLife)

                        this.renderer.canvas.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`
                        this.renderer.canvas.fillRect((9 + (18 * x)) * 3, (16+13 + (18 * y)) * 3, (Math.round(13 * (1-(rod.life/rod.maxLife)))) * 3, 1 * 3)
                    }

                    if (checkIfInside2((7 + (18 * x)) * 3, (15 + (18 * y)) * 3, 18 * 3, 18 * 3) == true) {
                        
                        this.renderer.canvas.fillStyle = "rgba(255, 255, 255, 0.5)"
                        this.renderer.canvas.fillRect((8 + (18 * x)) * 3, (16 + (18 * y)) * 3, 16 * 3, 16 * 3)
                        
                        if (this.columns[slotNumber] != null) {
                            var test = this.columns[slotNumber]
                            var toptext = `<p style="color: green; margin: 0px;">[ZIRNOX Fuel Rod]</p><p style="color: yellow; margin: 0px;">Generates ${test.heat} heat per tick</p>`
                            if (test.breeding == true) {
                                toptext = `<p style="color: darkgreen; margin: 0px;">[ZIRNOX Breeding Rod]</p><p style="color: yellow; margin: 0px;">Place next to fuel rods to breed</p>`
                            }

                            tooltip.innerHTML = `<b>${test.name}</b><p style="color: yellow; margin: 0px;">Depletion: ${(test.life/test.maxLife*100).toFixed(3)}%</p>${toptext}<p style="color: yellow; margin: 0px;">Lasts ${test.maxLife} ticks</p>`
                            tooltip.style.visibility = "visible"
                        }

                        if (this.awaitingClick == true) {
                            this.awaitingClick = false
                            options.rodSelected = slotNumber
                        }
                    }

                    if (options.rodSelected == slotNumber) {
                        this.renderer.canvas.fillStyle = "rgba(255, 255, 255, 0.5)"
                        this.renderer.canvas.fillRect((8 + (18 * x)) * 3, (16 + (18 * y)) * 3, 16 * 3, 16 * 3)
                    }
                }
                indicator = !indicator
            }
        }

        if (this.awaitingClick == true) {
            options.rodSelected = -1
        }
        this.awaitingClick = false
    }

    stopSimulation() {
        this.columns = this.editColumns
        this.water = 0
        this.steam = 0
        this.pressure = 0
        this.temperature = 0
        options.frames = 0
        document.getElementById("explosionText").style.visibility = "hidden"
    }
}
