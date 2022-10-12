<div align="center">
<table><tr>
<td><img src="./doc/easyeda-logo.png" height=100 /></td>
<td><img src="./doc/logo.png" height=100 /></td>
</tr></table>
<h1>ARTLogics EasyEDA Extension</h1>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.1-green.svg)](https://semver.org)
</div>


Generating wiring list between components.
Developed to help ARTLogics hardware designers.


## Installation

* Download [easyeda-artlogics-develop.zip](https://github.com/hotteshen/easyeda-artlogics/archive/refs/heads/develop.zip)
* Extract the downloaded archive on your hard drive
* In EasyEDA, open **Extension Settings** by using main menu `Advanced > Extensions > Extension Settings`
* Click `Load Extension` button and add all the files in the `extension` folder of the extracted source folder
* Click `Load Extension` button and close the **Extension Settings** dialog


## Generating Wiring List

**Wiring List** feature is only available in schematic editor. It is not available for PCB editor or any other kind of viewer instances.

* Open a schematics
* Select two or more connecters wired each other, or select wires and netflags together by mouse dragging
* Click `ART Logics > Generate Wiring List` on the menu bar
* If the result table is good, press `Ctrl+A` and paste to document editor (MS Word or LibreOffice Writer)

<img src="./doc/usage.gif" />


## Wire Size and Color

From version 1.1.0, **Wiring List**  feature supports automatic size and color adding to the table.

Annotation on schematic | Wire size column value
------------------------|-----------------------
`Wire Size = 1`         | 1
`WIRE_SIZE=0.5`         | 0.5
`wire-size = 2`         | 2
other                   | (none)

Wire stroke color   | Wire stroke style | Wire color column value
--------------------|-------------------|------------------------
`#FF0000`           | line              | Red
`#0000FF`           | line              | Blue
`#000000`           | line              | Black
`#000000`           | dashed            | White
`#008800` (default) | dashed            | Orange
Other               | other             | (none)


## Limitations

* Wires with joints: If the wire has joints and devided into multi parts, the extension does not recognize the wiring.
* (fixed on v1.0.1) ~Net flags~
* (fixed on v1.1.1) ~Incorrect list when pin number text is not matching Spice pin number~
