var extensionId = 'extension-artlogics'.split('-')[1];

function _essensify_part(part) {
    let annotation_list = []
    for (const[key, value] of Object.entries(part.annotation)) {
        annotation_list.push(value.string)
    }
    let pins = {}
    for (const[key, value] of Object.entries(part.pin)) {
        pins[value.configure.spicePin] = {
            name: value.name.text,
            x: value.pinDot.x,
            y: value.pinDot.y
        }
    }
    return {
        // _id: part.head.gId,
        id: annotation_list[1],
        desc: annotation_list[0],
        pins: pins
    }
}

function _essensify_wire(wire) {
    return {
        id: wire.gId,
        points: wire.pointArr
    }
}
/**
 * Extract essential informations of a schematic source
 * @param  {[Object]} source Source JSON object
 * @return {[Object]}        Source JSON object with essential parts and wiresinformations
 */
function essensify_source(source) {
    let parts = []
    let wires = []
    for (const[id, _part] of Object.entries(source.schlib)) {
        if (id.startsWith('frame_lib')) {
            continue
        }
        parts.push(_essensify_part(_part))
    }

    for (const[id, _wire] of Object.entries(source.wire)) {
        wires.push(_essensify_wire(_wire))
    }
    return {
        parts: parts,
        wires: wires
    }
}

function TableRow(connector1, connector2, thickness, color, description) {
    this.connector1 = connector1
    this.connector2 = connector2
    this.thickness = thickness
    this.color = color
    this.description = description
}

function _is_in(point, points) {
    for (const p of points) {
        if (p.x == point.x && p.y == point.y) {
            return true
        }
    }
    return false
}

function _is_wired(pin_a, pin_b, wires) {
    for (const wire of wires) {
        if (_is_in(pin_a, wire.points) && _is_in(pin_b, wire.points)) {
            return true
        }
    }
    return false
}

function list_wiring(essential_source) {
    let table = []
    for (let i = 0; i < essential_source.parts.length; i++) {
        const a = essential_source.parts[i]
        for (let j = i+1; j < essential_source.parts.length; j++) {
            const b = essential_source.parts[j]
            for (const[pin_a_id, pin_a] of Object.entries(a.pins)) {
                for (const[pin_b_id, pin_b] of Object.entries(b.pins)) {
                    if (_is_wired(pin_a, pin_b, essential_source.wires)) {
                        table.push(new TableRow(
                            a.id + '-' + pin_a_id,
                            b.id + '-' + pin_b_id,
                            '',
                            '',
                            ''
                        ))
                    }
                }
            }
        }
    }
    return table
}

function print_table() {
    const src = api('getSource', {type:'json'});
    console.table(
        list_wiring(
            essensify_source(src)
        )
    )    
}

api('createCommand', {
    'extension-generate-wiringlist' : () => {
        print_table();
    }
});

api('createToolbarButton', {
    icon: api('getRes', { file: 'logo.png' }),
    title: 'Main Menu Item Tooltip',
    fordoctype: 'sch',
    menu:[
        {
            "text":"Generate Wiring List", 
            "cmd":"extension-generate-wiringlist",
            icon: api('getRes', { file: 'logo.png' })
        },
    ]
});
