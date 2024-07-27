package com.example.chatApp.models.enums;

import lombok.Getter;

public enum DataUnit {
    BYTE(1),
    KILOBYTE_IN_BYTES(1024),
    MEGABYTE_IN_BYTES(1048576),
    MEGABYTE_IN_KILOBYTES(1048576),
    GIGABYTE_IN_MEGABYTES(1024);

    private final int units;

    DataUnit(int units) {
        this.units = units;
    }

    public int getUnits() {
        return units;
    }
}

