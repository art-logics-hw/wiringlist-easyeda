const extension = require('../extension/main.js')
const src = require('./src.json')

test("_essensify_part(): extract essential part information", () => {
    const id = "gge1dc71d6334fc68d7"
    const part = src.schlib[id]
    const essentified_part = {
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
    expect(extension._essensify_part(part)).toMatchObject(essentified_part)
})

test("_essensify_wire(): extract essential wire information", () => {
    const id = "gge571"
    const wire = src.wire[id]
    const essentified_wire = {
        id: wire.gId,
        points: wire.pointArr
    }
    expect(extension._essensify_wire(wire)).toMatchObject(essentified_wire)
})

test("essensify_source(): extract essential information", () => {
    const essensified_source = extension.essensify_source(src)
    const parts = essensified_source.parts
    expect(parts.length).toEqual(2)
    expect(parts[0]._id).toEqual("ggec6d93d66490ec27a")
    expect(essensified_source.wires.length).toEqual(3)
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
