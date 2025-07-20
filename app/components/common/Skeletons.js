// app/components/common/Skeletons.js
"use client";

import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);