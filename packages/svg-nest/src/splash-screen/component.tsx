import { useCallback, useState, useLayoutEffect, memo } from 'react';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UploadIcon from '@mui/icons-material/Upload';
import GitHubIcon from '@mui/icons-material/GitHub';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

import { HelpItem } from './help-item';
import { Logo } from './logo';

const SplashScreen = ({ onOpenApp }: { onOpenApp: (isLoadFile: boolean) => void }) => {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [isDrawerHorizontal, setDrawerHorizontal] = useState(true);
    const handleOpenDemo = useCallback(() => onOpenApp(false), []);
    const handleOpenUpload = useCallback(() => onOpenApp(true), []);
    const handleOpenDrawer = useCallback(() => setDrawerOpen(true), []);
    const handleCloseDrawer = useCallback(() => setDrawerOpen(false), []);
    const handleVisitGithub = useCallback(() => window.open('https://github.com/Jack000/SVGnest', '_blank'), []);
    const handleResize = useCallback(() => setDrawerHorizontal(window.innerWidth > window.innerHeight), []);

    useLayoutEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Stack
            sx={{ width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center' }}
            gap={{ xs: 0.5, sm: 1 }}
        >
            <Logo />
            <Typography sx={{ typography: { md: 'h4', xs: 'h5' } }}>SVGnest</Typography>
            <Typography sx={{ typography: { md: 'h5', xs: 'body1' } }}>Open Source nesting</Typography>
            <Stack gap={{ xs: 1, sm: 2 }} direction="row" flexWrap="wrap" paddingX={1} justifyContent="center">
                <Button variant="outlined" startIcon={<PlayArrowIcon />} onClick={handleOpenDemo}>
                    Demo
                </Button>
                <Button variant="outlined" startIcon={<UploadIcon />} onClick={handleOpenUpload}>
                    Upload SVG
                </Button>
                <Button variant="outlined" startIcon={<GitHubIcon />} onClick={handleVisitGithub}>
                    Github
                </Button>
                <Button variant="outlined" startIcon={<QuestionMarkIcon />} onClick={handleOpenDrawer}>
                    FAQ
                </Button>
            </Stack>
            <Drawer open={isDrawerOpen} onClose={handleCloseDrawer} anchor={isDrawerHorizontal ? 'right' : 'bottom'}>
                <Stack
                    boxSizing="border-box"
                    width={isDrawerHorizontal ? '50vw' : '100vw'}
                    height={isDrawerHorizontal ? '100vh' : '50vh'}
                    gap={2}
                    paddingY={2}
                    paddingX={3}
                >
                    <HelpItem title="What exactly is 'nesting'?">
                        If you have some parts to cut out of a piece of metal/plastic/wood etc, you'd want to arrange the parts
                        to use as little material as possible. This is a common problem if you use a laser cutter, plasma
                        cutter, or CNC machine.In computer terms this is called the irregular bin-packing problem
                    </HelpItem>
                    <HelpItem title="How much does it cost?">
                        <p>
                            It's free and open source. The code and implementation details are on
                            <a href="https://github.com/Jack000/SVGnest" target="_blank">
                                Github
                            </a>
                        </p>
                    </HelpItem>
                    <HelpItem title="Does it use inches? mm?">
                        SVG has its internal units, the distance related fields in the settings use SVG units, ie. pixels. The
                        conversion between a pixel and real units depend on the exporting software, but it's typically 72 pixels
                        = 1 inch
                    </HelpItem>
                    <HelpItem title="My SVG text/image doesn't show up?">
                        Nesting only works for closed shapes, so SVG elements that don't represent closed shapes are removed.
                        Convert text and any other elements to outlines first. Ensure that outlines do not intersect or overlap
                        eachother. Outlines that are inside other outlines are considered holes.
                    </HelpItem>
                    <HelpItem title="It doesn't ever stop?">
                        The software will continuously look for better solutions until you press the stop button. You can stop
                        at any time and download the SVG file.
                    </HelpItem>
                    <HelpItem title="Some parts seem to slightly overlap?">
                        Curved shapes are approximated with line segments. For a more accurate nest with curved parts, decrease
                        the curve tolerance parameter in the configuration.
                    </HelpItem>
                    <HelpItem title="I need help?">
                        <p>
                            Add an issue on Github or contact me personally: <a href="http://jack.works">jack.works</a>
                        </p>
                    </HelpItem>
                </Stack>
            </Drawer>
        </Stack>
    );
};

export default memo(SplashScreen);