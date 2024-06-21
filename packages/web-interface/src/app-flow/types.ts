//@ts-ignore
import { SvgNest } from 'polygon-packer'

export enum BUTTON_ACTION {
    START = 'start',
    UPLOAD = 'upload',
    DOWNLOAD = 'download',
    SETTINGS = 'settings',
    CLOSE_SETTINGS = 'closeSettings',
    ZOOM_IN = 'zoomIn',
    ZOOM_OUT = 'zoomOut',
    BACK = 'back'
}

export enum SETTING_ID {
    SPACING = 'spacing',
    CURVE_TOLERANCE = 'curveTolerance',
    ROTATIONS = 'rotations',
    POPULATION_SIZE = 'populationSize',
    MUTATION_RATE = 'mutationRate',
    USE_HOLES = 'useHoles',
    EXPLORE_CONCAVE = 'exploreConcave'
}

export enum INPUT_TYPE {
    NUMBER,
    BOOLEAN
}

export interface AppFlowProps {
    isDemoMode: boolean
    onClose(): void
}

export interface SettingsData {
    [SETTING_ID.CURVE_TOLERANCE]: number
    [SETTING_ID.SPACING]: number
    [SETTING_ID.ROTATIONS]: number
    [SETTING_ID.POPULATION_SIZE]: number
    [SETTING_ID.MUTATION_RATE]: number
    [SETTING_ID.USE_HOLES]: boolean
    [SETTING_ID.EXPLORE_CONCAVE]: boolean
}

export interface SettingConfig {
    id: SETTING_ID
    label: string
    type: INPUT_TYPE
    description: string
    min: number
    max: number
    step: number
}

export type NestingStatistics = {
    efficiency: number
    placed: number
    total: number
}

export interface ReducerState {
    svgSrc: string
    isWorking: boolean
    settings: SettingsData
    isDrawerOpen: boolean
    svgNest: SvgNest
    fileReader: FileReader
    scale: number
    progress: number
    startTime: number
    estimate: number
    iterations: number
    nestingStatistics: NestingStatistics
}

export enum REDUCER_ACTION {
    TOGGLE_DRAWER,
    CHANGE_SETTINGS,
    UPDATE_SVG,
    DOWNLOAD_SVG,
    ZOOM_IN,
    ZOOM_OUT,
    PROGRESS,
    START_NESTING,
    UPDATE_STATISTICS
}

export type ReducerMiddleware = (prevState: ReducerState, payload: unknown) => ReducerState

export type ReducerAction = {
    type: REDUCER_ACTION
    payload: unknown
}

export enum PREDEFINED_ID {
    FILE_SAVER = 'fileSaver',
    SELECTED_ELEMENT = 'selectedElement',
    BACKGROUND_RECT = 'backgroundRect'
}

export type ViewBoxAttribute = 'x' | 'y' | 'width' | 'height'
