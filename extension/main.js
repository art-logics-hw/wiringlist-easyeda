let extensionId = 'extension-artlogics'.split('-')[1];

function _essensify_part(part) {
    let annotation_list = []
    for (const[key, value] of Object.entries(part.annotation)) {
        annotation_list.push(value.string)
    }
    let pins = {}
    for (const[key, value] of Object.entries(part.pin)) {
        pins[value.configure.spicePin] = {
            // pin object has three key properties - configure.spicepin, num.text, ,name.text.
            // Using num.text temporarily here.
            name: value.num.text,
            x: value.pinDot.x,
            y: value.pinDot.y
        }
    }
    return {
        _id: part.head.gId,
        id: annotation_list[1],
        desc: annotation_list[0],
        pins: pins
    }
}

function _essensify_netflag(netflag) {
    return {
        name: netflag.mark.netFlagString,
        x: netflag.configure.x,
        y: netflag.configure.y
    }
}

function _essensify_wire(wire) {
    return {
        id: wire.gId,
        points: wire.pointArr,
        strokeColor: wire.strokeColor,
        strokeStyle: wire.strokeStyle
    }
}

/**
 * Extract essential informations of a schematic source
 * @param  {[Object]} source Source JSON object
 * @return {[Object]}        Source JSON object with essential parts and wiresinformations
 */
function essensify_source(source, ids=[]) {
    let wire_size = ''
    for (const[_annotation_id, annotation] of Object.entries(source.annotation)) {
        if (ids.indexOf(_annotation_id) != -1) {
            let text = annotation.string.toLowerCase().replace(/ /g, '').replace(/-/g, '').replace(/_/g, '')
            if (text.startsWith('wiresize=')) {
                wire_size = text.substring(9)
                console.log(wire_size)
            }
        }
    }
    let parts = []
    let netflags = []
    let wires = []
    for (const[id, _part] of Object.entries(source.schlib)) {
        if (id.startsWith('frame_lib')) {
            continue
        }
        if (ids.length == 0) {
            parts.push(_essensify_part(_part))
        } else {
            part = _essensify_part(_part)
            for (const id of ids) {
                if (part._id == id) {
                    parts.push(part)
                    break
                }
            }
        }
    }
    for (const[id, _netflag] of Object.entries(source.netflag)) {
        netflags.push(_essensify_netflag(_netflag))
    }

    for (const[id, _wire] of Object.entries(source.wire)) {
        wires.push(_essensify_wire(_wire))
    }
    return {
        parts: parts,
        netflags: netflags,
        wires: wires,
        wire_size: wire_size
    }
}

function TableRow(connector1, connector2, size, color, description) {
    this.connector1 = connector1
    this.connector2 = connector2
    this.size = size
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

function _get_wire_color(pin_a, wires) {
    for (const wire of wires) {
        if (_is_in(pin_a, wire.points)) {
            if (wire.strokeColor == '#000000' && wire.strokeStyle == 1) {
                return 'White'
            } else if (wire.strokeColor == '#000000') {
                return 'Black'
            } else if (wire.strokeColor == '#FF0000') {
                return 'Red'
            } else if (wire.strokeColor == '#0000FF') {
                return 'Blue'
            } else if (wire.strokeColor == '#008800') { // for the default dark green color wires
                return 'Orange'
            }
        }
    }
    return ''
}

function list_wiring(essential_source) {
    let table = []
    for (let i = 0;i < essential_source.parts.length;i++) {
        const a = essential_source.parts[i]
        for (let j = i+1;j < essential_source.parts.length;j++) {
            const b = essential_source.parts[j]
            for (const[pin_a_id, pin_a] of Object.entries(a.pins)) {
                for (const[pin_b_id, pin_b] of Object.entries(b.pins)) {
                    if (_is_wired(pin_a, pin_b, essential_source.wires)) {
                        table.push(new TableRow(
                            // a.id + '-' + pin_a_id,  // some components have different pin naming with Spice model
                            // b.id + '-' + pin_b_id,  // some components have different pin naming with Spice model
                            a.id + '-' + pin_a.name,
                            b.id + '-' + pin_b.name,
                            essential_source.wire_size,
                            _get_wire_color(pin_a, essential_source.wires),
                            ''
                        ))
                    }
                }
            }
        }
        for (const netflag of essential_source.netflags) {
            for (const[pin_a_id, pin_a] of Object.entries(a.pins)) {
                if (_is_wired(pin_a, netflag, essential_source.wires)) {
                    table.push(new TableRow(
                        // a.id + '-' + pin_a_id,  // some components have different pin naming with Spice model
                        a.id + '-' + pin_a.name,
                        netflag.name,
                        essential_source.wire_size,
                        _get_wire_color(pin_a, essential_source.wires),
                        ''
                    ))
                }
            }
        }
    }
    return table
}

function print_table(src, ids = []) {
    let table = list_wiring(essensify_source(src, ids))
    // console.table(table)
    const thead = '<tr><th>Connector 1</th><th>Connector 2</th><th>Size</th><th>Color</th><th>Description</th></tr>'
    let tbody = ''
    for (const row of table) {
        tbody += `<tr><td>${row.connector1}</td><td>${row.connector2}</td><td>${row.size}</td><td>${row.color}</td><td>${row.description}</td></tr>`
    }
    const css = `
    html {
        overflow-x: hidden;
        overflow-y: hidden;
        }
    div {
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        }
    table { 
        width: 750px;
        border-collapse: collapse;
        margin:50px auto;
        }
    /* Zebra striping */
    tr:nth-of-type(odd) { 
        background: #eee;
        }
    th { 
        background: #c00000;
        color: white;
        font-weight: bold;
        }
    td, th { 
        padding: 10px;
        border: 1px solid #ccc;
        text-align: left;
        font-size: 18px;
        }`
    const html = `<html><head><title>ART Logics Wiring List</title><style>${css}</style></head><body><div><table>${thead}${tbody}</table></div></body></html>`
    const width = 800
    const height = 600
    let left, top
    left = (window.screen.width / 2) - ((width / 2) + 10)
    top = (window.screen.height / 2) - ((height / 2) + 50)
    const winUrl = URL.createObjectURL(
        new Blob([html], { type: "text/html" })
    );
    let newWin = window.open(winUrl,'ART Logics Wiring List', `status=no,height=${height},width=${width},resizable=yes,left=${left},top=${top},screenX=${left},screenY=${top},toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`)
}

try {
    /* api() function is defined in EasyEDA's javascript context.
       this makes on Jest test failing.
       So wrap with try-catch statement, to run tests
    */
    api('createCommand', {
        'extension-generate-wiringlist' : () => {
            ids = api('getSelectedIds')
            ids = ids.split(',')
            if (ids.length == 1 && ids[0] == '') {
                ids = []
            }
            if (ids.length == 0) {
                $.messager.error("No part selected. Select parts and try again!")
            } else {
                const src = api('getSource', {type:'json'})
                console.log(src)
                console.log(ids)
                print_table(src, ids)
            }
        }
    })

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
    })
} catch {
    console.log('api() function call failed.')

    /* module.exports gets error on EasyEDA's loading.
       So it needed to be moved into this scope to not be excuted from EasyEDA
    */
    module.exports = {
        _essensify_part: _essensify_part,
        _essensify_netflag: _essensify_netflag,
        _essensify_wire: _essensify_wire,
        essensify_source: essensify_source,
        _is_in: _is_in,
        list_wiring: list_wiring
    }
}
