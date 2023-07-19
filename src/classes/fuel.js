// Classes
class ZIRNOXFuel {
    constructor(maxLife, heat, breeding = false) {
        this.column = null

        // This simplicity wtf
        this.maxLife = maxLife
        this.life = 0//maxLife
        this.heat = heat
        this.breeding = breeding
        
        this.name = ""
        this.texture = "https://raw.githubusercontent.com/HbmMods/Hbm-s-Nuclear-Tech-GIT/master/src/main/resources/assets/hbm/textures/items/rod_zirnox_empty.png"
    }

    setName(name) {
        this.name = name
    }
    setTexture(texture) {
        this.texture = `https://raw.githubusercontent.com/HbmMods/Hbm-s-Nuclear-Tech-GIT/master/src/main/resources/assets/hbm/textures/items/${texture}.png`
    }
}
class ZIRNOXDepletedFuel {
    constructor(name, texture) {
        this.name = "You are not supposed to have this"
        this.texture = "https://raw.githubusercontent.com/HbmMods/Hbm-s-Nuclear-Tech-GIT/master/src/main/resources/assets/hbm/textures/items/rod_zirnox_empty.png"        
    }
}

// Fuels
class NONE extends ZIRNOXFuel {
    constructor() {
        super()
        this.setName("Empty ZIRNOX Rod")
        this.setTexture("rod_zirnox_empty")
    }
}

class NATURAL_URANIUM_FUEL extends ZIRNOXFuel {
    constructor() {
        super(250000, 30, false)
        this.setName("ZIRNOX Natural Uranium Fuel Rod")
        this.setTexture("rod_zirnox_natural_uranium_fuel")
    }
}
class URANIUM_FUEL extends ZIRNOXFuel {
    constructor() {
        super(200000, 50, false)
        this.setName("ZIRNOX Uranium Fuel Rod")
        this.setTexture("rod_zirnox_uranium_fuel")
    }
}
class TH232 extends ZIRNOXFuel {
    constructor() {
        super(20000, 0, true)
        this.setName("ZIRNOX Thorium-232 Rod")
        this.setTexture("rod_zirnox_th232")
    }
}
class THORIUM_FUEL extends ZIRNOXFuel {
    constructor() {
        super(200000, 40, false)
        this.setName("ZIRNOX Thorium Fuel Rod")
        this.setTexture("rod_zirnox_thorium_fuel")
    }
}
class MOX_FUEL extends ZIRNOXFuel {
    constructor() {
        super(165000, 75, false)
        this.setName("ZIRNOX MOX Fuel Rod")
        this.setTexture("rod_zirnox_mox_fuel")
    }
}
class PLUTONIUM_FUEL extends ZIRNOXFuel {
    constructor() {
        super(175000, 65, false)
        this.setName("ZIRNOX Plutoinum Fuel Rod")
        this.setTexture("rod_zirnox_plutonium_fuel")
    }
}
class U233_FUEL extends ZIRNOXFuel {
    constructor() {
        super(150000, 100, false)
        this.setName("ZIRNOX Uranium-233 Fuel Rod")
        this.setTexture("rod_zirnox_u233_fuel")
    }
}
class U235_FUEL extends ZIRNOXFuel {
    constructor() {
        super(165000, 85, false)
        this.setName("ZIRNOX Uranium-235 Fuel Rod")
        this.setTexture("rod_zirnox_u235_fuel")
    }
}
class LES_FUEL extends ZIRNOXFuel {
    constructor() {
        super(150000, 150, false)
        this.setName("ZIRNOX LES Fuel Rod")
        this.setTexture("rod_zirnox_les_fuel")
    }
}
class LITHIUM extends ZIRNOXFuel {
    constructor() {
        super(20000, 0, true)
        this.setName("ZIRNOX Lithium Rod")
        this.setTexture("rod_zirnox_lithium")
    }
}
class ZFB_MOX extends ZIRNOXFuel {
    constructor() {
        super(50000, 35, false)
        this.setName("ZIRNOX ZFB MOX Fuel Rod")
        this.setTexture("rod_zirnox_zfb_mox")
    }
}

var fuels = [NONE, NATURAL_URANIUM_FUEL, URANIUM_FUEL, TH232, THORIUM_FUEL, MOX_FUEL, PLUTONIUM_FUEL, U233_FUEL, U235_FUEL, LES_FUEL, LITHIUM, ZFB_MOX]
var depletedfuels = []
var fueltextures = {}

// Loop through fuel again and make texture for it
fuels.forEach(fuel => {
    var testfuel = new fuel()
    fueltextures[testfuel.name] = new Image()
    fueltextures[testfuel.name].src = testfuel.texture
})
depletedfuels.forEach(fuel => {
    var testfuel = new fuel()
    fueltextures[testfuel.name] = new Image()
    fueltextures[testfuel.name].src = testfuel.texture
})

var fuelmap = {
    [NATURAL_URANIUM_FUEL]: NONE
}