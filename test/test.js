const extension = require('../extension/main.js')
const src = require('./src.json')

test("_essensify_part(): extract essential part information", () => {
    const id = "gge1dc71d6334fc68d7"
    const part = src.schlib[id]
    const essential_part = {
        "_id": id,
        "desc": "B4B-XH-A(LF)(SN)",
        "id": "CN-XH",
        "pins": {
            "1": {"name": "1", "x": 570, "y": -425},
            "2": {"name": "2", "x": 570, "y": -435},
            "3": {"name": "3", "x": 570, "y": -445},
            "4": {"name": "4", "x": 570, "y": -455}
        }
    }
    expect(extension._essensify_part(part)).toMatchObject(essential_part)
})

test("_essensify_netflag(): extract essential netflag information", () => {
    const id = "gge609"
    const netflag = src.netflag[id]
    const essential_netflag = {
        "name": netflag.mark.netFlagString,
        "x": netflag.configure.x,
        "y": netflag.configure.y
    }
    expect(extension._essensify_netflag(netflag)).toMatchObject(essential_netflag)
})

test("_essensify_wire(): extract essential wire information", () => {
    const id = "gge571"
    const wire = src.wire[id]
    const essential_wire = {
        id: wire.gId,
        points: wire.pointArr
    }
    expect(extension._essensify_wire(wire)).toMatchObject(essential_wire)
})

test("essensify_source(): extract essential information", () => {
    let essential_source = extension.essensify_source(src)
    const parts = essential_source.parts
    expect(parts.length).toEqual(2)
    expect(parts[0]._id).toEqual("ggec6d93d66490ec27a")
    expect(essential_source.wires.length).toEqual(4)
    expect(essential_source.netflags.length).toEqual(1)
    
    essential_source = extension.essensify_source(src, ["ggec6d93d66490ec27a"])
    expect(essential_source.parts.length).toEqual(1)
})

test("_is_in(): check if a point is in a points list", () => {
    const p = {x: 1, y: 2}
    const plist_1 = [
        {x: 0, y: 4},
        {x: 1, y: 2},
        {x: 2, y: 0}
    ]
    expect(extension._is_in(p, plist_1)).toEqual(true)
    const plist_2 = [
        {x: 0, y: 4},
        {x: 2, y: 0}
    ]
    expect(extension._is_in(p, plist_2)).toEqual(false)
})

test("list_wiring(): get wiring list", () => {
    const essential_source = extension.essensify_source(src)
    const table = [
        {"color": "", "connector1": "U1-1", "connector2": "CN-XH-4", "description": "", "size": ""},
        {"color": "", "connector1": "U1-2", "connector2": "CN-XH-3", "description": "", "size": ""},
        {"color": "", "connector1": "U1-4", "connector2": "CN-XH-1", "description": "", "size": ""},
        {"color": "", "connector1": "CN-XH-2", "connector2": "SPECIAL", "description": "", "size": ""}
    ]
    expect(extension.list_wiring((essential_source))).toMatchObject(table)
})
