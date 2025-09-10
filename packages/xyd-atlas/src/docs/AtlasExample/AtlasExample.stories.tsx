import React, {useState, useEffect} from 'react';
import type {Meta} from '@storybook/react';

import {Reference} from '@xyd-js/uniform';

import type {MDXReference} from "@/utils/mdx";
import {Atlas} from '@/components/Atlas';
import {uniformToReferences} from "./uniform-to-references";

const HelloWorld = () => {
    return <h1>Hello, World!</h1>;
};

export default {
    title: 'Atlas/Atlas',
    component: HelloWorld,
} as Meta;

// const Template = (args) => <Atlas/>;

const Template = (args) => {
    const [references, setReferences] = useState<Reference[] | []>([])

    async function load() {
        const resp = await uniformToReferences()
        const refs = Array.isArray(resp) ? resp : (resp?.references || [])
        if (refs && refs.length) {
            setReferences(refs)
        }
    }

    useEffect(() => {
        load()
    }, [])

    return <div style={{
        width: "1200px",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        margin: "0 auto"
    }}>
        <Atlas kind="primary" references={references}/>
    </div>
}

export const Default = Template.bind({});
Default.args = {};
