import { createBrowserRouter, Router } from "react-router";
import HomeLayout from "../component/HomeLayout";
import Home from "../component/Home";
import Bankers from "../Pages/Bankers";
import BasicStatic from "../Pages/BasicStatic";
import RMS from "../Pages/RMS";
import EarliestDeadline from "../Pages/EarliestDeadline";
import FCFS from "../Pages/FCFS";
import SJF from "../Pages/SJF";
import SRTF from "../Pages/SRTF";
import RoundRobin from "../Pages/RoundRobin";
import PriorityScheduling from "../Pages/PriorityScheduling";
import FIFO from "../Pages/Disc/FIFO";
import SSTF from "../Pages/Disc/SSTF";
import SCAN from "../Pages/Disc/SCAN";
import CSCAN from "../Pages/Disc/CSCAN";
import LOOK from "../Pages/Disc/LOOK";
import CLOOK from "../Pages/Disc/CLOOK";
import LIFO from "../Pages/Disc/LIFO";
import About from "../component/About";

export const router = createBrowserRouter([
    {
        path : "",
        Component : HomeLayout,
        children : [
            {
                index: true,
                Component : Home
            },
            {
                path : "bankers-algorithm",
                Component : Bankers
            },
            {
                path : "blog",
                element : <h2>this is blog</h2>
            },
            {
                path: "basic-static",
                Component : BasicStatic
            },
            {
                path : "rate-monotonic",
                Component : RMS
            },
            {
                path : "edf",
                Component : EarliestDeadline
            },
            {
                path : "fcfs",
                Component : FCFS
            },
            {
                path : "sjf",
                Component : SJF
            },
            {
                path : "srtf",
                Component : SRTF
            },
            {
                path : "rr",
                Component : RoundRobin
            },
            {
                path : "priority",
                Component : PriorityScheduling
            },
            {
                path : "fifo",
                Component : FIFO
            },
            {
                path : "sstf",
                Component : SSTF
            },
            {
                path : "scan",
                Component : SCAN
            },
            {
                path : "cscan",
                Component : CSCAN
            },
            {
                path : "look",
                Component : LOOK
            },
            {
                path : "clook",
                Component : CLOOK
            },
            {
                path : "lifo",
                Component : LIFO
            }
        ]
    },
    {
        path : "about",
        Component: About
    }
])
