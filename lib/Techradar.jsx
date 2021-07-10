/** @jsx jsx */
import { jsx, ThemeProvider } from '@emotion/react';
import styled from '@emotion/styled'
import { React, useState, useEffect, useRef } from 'react';
import D3Component from './D3Component';
import fetchedData from './data';
import { Button, theme as defaultButtonTheme  } from 'sergey-components-library';

import './main.css';

let vis;

export default function Techradar() {
  const [data, setData] = useState(null);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);
  const [active, setActive] = useState(null);
  const refElement = useRef(null);

  useEffect(fetchData, []);
  useEffect(handleResizeEvent, []);
  useEffect(initVis, [ data ]);
  useEffect(updateVisOnResize, [ width, height ]);

  function fetchData() {
    const IDEAL_BLIP_WIDTH = 22
    Promise.resolve().then(() => setData(fetchedData.points.map((point, i) => ({...point, id: i, width: IDEAL_BLIP_WIDTH}))));
  }

  function handleResizeEvent() {
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
      }, 300);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }

  function initVis() {
    if(data && data.length) {
      const d3Props = {
        data,
        width,
        height,
        onDatapointClick: setActive
      };
      vis = new D3Component(refElement.current, d3Props);
    }
  }

  function updateVisOnResize() {
    vis && vis.resize(width, height);
  }

  const theme = {
    palette: {
      primary: {
        main: 'red',
      }
    }
  }

  const SomeText = styled.div`
    color: ${props => {
      return props.theme.palette.primary.main;
    }};
  `

  return (
    <ThemeProvider theme={theme}>
      <Button variant="solid"
        color="primary"
        size="small"
        enableElevation
        disabled>
        Small Outline Elevated Button</Button>
      <SomeText>HEEEEEY</SomeText>
      <div ref={refElement} />
  </ThemeProvider>
  );
}
