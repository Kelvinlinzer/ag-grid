import './example-runner-result.scss';
import React, { useEffect, useState } from 'react';
import fs from 'fs';
import { useExampleFileNodes } from './use-example-file-nodes';
import { generateIndexHtml } from './index-html-generator';

const ExampleRunnerResult = ({ isVisible, exampleInfo }) => {
    const [shouldExecute, setShouldExecute] = useState(isVisible);

    const nodes = useExampleFileNodes();
    const { name, appLocation: modulesLocation, framework } = exampleInfo;
    const generated = generateIndexHtml(nodes, exampleInfo, true);

    if (typeof window === 'undefined') {
        // generate code for the website to read at runtime
        fs.writeFileSync(`public${modulesLocation}index.html`, generated);

        const packagesLocation = modulesLocation.replace('/modules/', '/packages/');

        fs.writeFileSync(`public${packagesLocation}index.html`, generated);

        if (framework === 'react') {
            // need to ensure functional version is also generated
            fs.writeFileSync(`public${modulesLocation.replace('/react/', '/reactFunctional/')}index.html`, generated);
            fs.writeFileSync(`public${packagesLocation.replace('/react/', '/reactFunctional/')}index.html`, generated);
        }
    }

    useEffect(() => {
        if (isVisible) {
            setShouldExecute(true);
        }
    }, [isVisible]);

    const iframeRef = React.createRef();

    useEffect(() => {
        if (shouldExecute) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            iframeDoc.open();
            iframeDoc.write(generated);
            iframeDoc.close();
        }
    }, [shouldExecute, generated]); // eslint-disable-line react-hooks/exhaustive-deps

    return <iframe ref={iframeRef} title={name} className="example-runner-result"></iframe>;
};

export default ExampleRunnerResult;