let extensionId = 'extension-artlogics'.split('-')[1];

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
        _id: part.head.gId,
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
function essensify_source(source, ids=[]) {
    let parts = []
    let wires = []
    for (const[id, _part] of Object.entries(source.schlib)) {
        if (id.startsWith('frame_lib')) {
            continue
        }
        if (ids.length == 0) {
            parts.push(_essensify_part(_part))
        } else {
            part = _essensify_part(_part)
            if (part._id == ids[0] || part._id == ids[1]) {
                parts.push(part)
            }
        }
    }

    console.log(ids, parts)

    for (const[id, _wire] of Object.entries(source.wire)) {
        wires.push(_essensify_wire(_wire))
    }
    return {
        parts: parts,
        wires: wires
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

function print_table(ids = []) {
    const src = api('getSource', {type:'json'})
    let table = list_wiring(essensify_source(src, ids))
    // console.table(table)
    const thead = '<tr><th>Connector 1</th><th>Connector 2</th><th>Size</th><th>Color</th><th>Description</th></tr>'
    let tbody = ''
    for (const row of table) {
        tbody += `<tr><td>${row.connector1}</td><td>${row.connector2}</td><td>${row.size}</td><td>${row.color}</td><td>${row.description}</td></tr>`
    }
    const css = `table { 
        width: 750px; 
        border-collapse: collapse; 
        margin:50px auto;
        }
    /* Zebra striping */
    tr:nth-of-type(odd) { 
        background: #eee; 
        }
    th { 
        background: #3498db; 
        color: white; 
        font-weight: bold; 
        }
    td, th { 
        padding: 10px; 
        border: 1px solid #ccc; 
        text-align: left; 
        font-size: 18px;
        }`
    const html = `<html><head><title>ART Logics Wiring List</title><style>${css}</style></head><body><table>${thead}${tbody}</table></body></html>`
    const width = 800
    const height = 600
    let left, top
    left = (window.screen.width / 2) - ((width / 2) + 10)
    top = (window.screen.height / 2) - ((height / 2) + 50)
    let newWin = window.open('url','ART Logics Wiring List', `status=no,height=${height},width=${width},resizable=yes,left=${left},top=${top},screenX=${left},screenY=${top},toolbar=no,menubar=no,scrollbars=no,location=no,directories=no`)
    newWin.document.write(html)
}

api('createCommand', {
    'extension-generate-wiringlist' : () => {
        ids = api('getSelectedIds')
		ids = ids.split(',')
        if (ids.length == 1 && ids[0] == '') {
            ids = []
        }
        if (ids.length == 0) {
            $.messager.error("No part selected. Select two parts and try again!")
        } else if (ids.length != 2) {
            $.messager.error("Must select only two parts.")
        } else {
            print_table(ids)
        }
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
