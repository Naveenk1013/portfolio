import React, { Suspense, useState, useEffect } from 'react';
import AnimeSkeleton from '../../components/Skeletons/AnimeSkeleton';

const AnimeWorld = React.lazy(() => import('./AnimeWorld.jsx'));

const AnimeWorldWrapper = () => {
    // This state trick bypasses React 18's concurrent mode transition stalling.
    // React Router wraps `navigate` in a transition, which keeps the OLD page
    // on screen until the new lazy chunk loads. By returning a non-suspended
    // component first, we force the browser to instantly jump to /anime.
    const [startLoad, setStartLoad] = useState(false);

    useEffect(() => {
        setStartLoad(true);
    }, []);

    if (!startLoad) {
        return <AnimeSkeleton />;
    }

    return (
        <Suspense fallback={<AnimeSkeleton />}>
            <AnimeWorld />
        </Suspense>
    );
};

export default AnimeWorldWrapper;
