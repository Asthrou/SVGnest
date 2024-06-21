import {
    NestingStatistics,
    REDUCER_ACTION,
    ReducerAction,
    ReducerMiddleware,
    ReducerState,
    SETTING_ID,
    SettingsData
} from './types'
import { PREDEFINED_ID } from './types'
import { INITIAL_NESTING_STATISTICS } from './constants'

const REDUCER = new Map<REDUCER_ACTION, ReducerMiddleware>([
    [
        REDUCER_ACTION.CHANGE_SETTINGS,
        (prevState, { id, value }: { id: SETTING_ID; value: string | boolean }) => {
            const { svgNest, isWorking } = prevState
            const settings: SettingsData = {
                ...prevState.settings,
                [id]: value
            }

            if (isWorking) {
                svgNest.stop()
            }

            svgNest.config(settings)

            return {
                ...prevState,
                settings,
                isWorking: false,
                startTime: 0,
                progress: 0,
                estimate: 0
            }
        }
    ],
    [
        REDUCER_ACTION.TOGGLE_DRAWER,
        (prevState, isDrawerOpen: boolean) => ({
            ...prevState,
            isDrawerOpen
        })
    ],
    [
        REDUCER_ACTION.UPDATE_SVG,
        (prevState, svgSrc: string) => {
            const { svgNest, isWorking } = prevState

            if (isWorking) {
                svgNest.stop()
            }

            return {
                ...prevState,
                svgSrc,
                isWorking: false,
                nestingStatistics: INITIAL_NESTING_STATISTICS,
                startTime: 0,
                progress: 0,
                estimate: 0
            }
        }
    ],
    [
        REDUCER_ACTION.DOWNLOAD_SVG,
        prevState => {
            const saver: HTMLLinkElement = document.getElementById(PREDEFINED_ID.FILE_SAVER) as HTMLLinkElement
            const blob = new Blob([prevState.svgSrc], { type: 'image/svg+xml;charset=utf-8' })
            const blobURL = (saver.href = URL.createObjectURL(blob)),
                body = document.body

            // @ts-ignore
            saver.download = 'SVGNestOutput.svg'

            saver.click()
            URL.revokeObjectURL(blobURL)

            return prevState
        }
    ],
    [
        REDUCER_ACTION.ZOOM_IN,
        prevState => ({
            ...prevState,
            scale: Math.min(prevState.scale + 0.2, 4)
        })
    ],
    [
        REDUCER_ACTION.ZOOM_OUT,
        prevState => ({
            ...prevState,
            scale: Math.max(prevState.scale - 0.2, 0.2)
        })
    ],
    [
        REDUCER_ACTION.START_NESTING,
        prevState => ({
            ...prevState,
            isWorking: true,
            startTime: 0
        })
    ],
    [
        REDUCER_ACTION.PROGRESS,
        (prevState, percent: number) => {
            const progress: number = Math.min(Math.ceil(percent * 100), 100)

            return percent > 0.02
                ? { ...prevState, progress, estimate: ((new Date().getTime() - prevState.startTime) / percent) * (1 - percent) }
                : { ...prevState, progress, estimate: 0, startTime: new Date().getTime() }
        }
    ],
    [
        REDUCER_ACTION.UPDATE_STATISTICS,
        (prevState, nestingStatistics: NestingStatistics) => ({
            ...prevState,
            nestingStatistics,
            iterations: ++prevState.iterations
        })
    ]
])

export default function (prevState: ReducerState, { type, payload }: ReducerAction) {
    return REDUCER.has(type) ? REDUCER.get(type)(prevState, payload) : prevState
}
