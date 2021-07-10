const data = {
  points: [
      {
          "name": "Design systems",
          "ring": "Adopt",
          "quadrant": "Techniques",
          "isNew": "FALSE",
          "description": "<p>As application development becomes increasingly dynamic and complex, it's a challenge to deliver accessible and usable products with consistent style. This is particularly true in larger organizations with multiple teams working on different products. <strong>Design systems</strong> define a collection of design patterns, component libraries and good design and engineering practices that ensure consistent digital products. Built on the corporate style guides of the past, design systems offer shared libraries and documents that are easy to find and use. Generally, guidance is written down as code and kept under version control so that the guide is less ambiguous and easier to maintain than simple documents. Design systems have become a standard approach when working across teams and disciplines in product development because they allow teams to focus. They can address strategic challenges around the product itself without reinventing the wheel every time a new visual component is needed.</p>"
      },
      {
          "name": "GitOps",
          "ring": "Hold",
          "quadrant": "Techniques",
          "isNew": "TRUE",
          "description": "<p>We suggest approaching <strong>GitOps</strong> with a degree of care, especially with regard to branching strategies. GitOps can be seen as a way of implementing <a href=\"/radar/techniques/infrastructure-as-code\">infrastructure as code</a> that involves continuously synchronizing and applying infrastructure code from <a href=\"/radar/tools/git\">Git</a> into various environments. When used with a \"branch per environment\" infrastructure, changes are promoted from one environment to the next by merging code. While treating code as the single source of truth is clearly a sound approach, we're seeing branch per environment lead to environmental drift and eventually environment-specific configs as code merges become problematic or even stop entirely. This is very similar to what we've seen in the past with <a href=\"/radar/techniques/long-lived-branches-with-gitflow\">long-lived branches with GitFlow</a>.</p>"
      },
      {
          "name": "Bit.dev",
          "ring": "Assess",
          "quadrant": "Platforms",
          "isNew": "TRUE",
          "description": "<p><strong><a href=\"https://bit.dev/\">Bit.dev</a></strong> is a cloud-hosted collaborative platform for UI components extracted, modularized and reused with <a href=\"https://github.com/teambit/bit\">Bit</a>. <a href=\"/radar/platforms/web-components-standard\">Web components</a> have been around for a while, but building a modern front-end application by assembling small, independent components extracted from other projects has never been easy. Bit was designed to let you do exactly that: extract a component from an existing library or project. You can either build your own service on top of Bit for component collaboration or use Bit.dev.</p>"
      },
      {
          "name": "Redash",
          "ring": "Trial",
          "quadrant": "Tools",
          "isNew": "TRUE",
          "description": "<p>Adopting a \"you build it, you run it\" DevOps philosophy means teams have increased attention on both technical and business metrics that can be extracted from the systems they deploy. Often we find that analytics tooling is difficult to access for most developers, so the work to capture and present metrics is left to other teams — long after features are shipped to end users. Our teams have found <strong><a href=\"https://redash.io/\">Redash</a></strong> to be very useful for querying product metrics and creating dashboards in a way that can be self-served by general developers, shortening feedback cycles and focusing the whole team on the business outcomes.</p>"
      },
      {
          "name": "GitHub Actions",
          "ring": "Assess",
          "quadrant": "Tools",
          "isNew": "TRUE",
          "description": "<p>CI servers and build tools are some of the oldest and most widely used in our kit. They run the gamut from simple cloud-hosted services to complex, code-defined pipeline servers that support fleets of build machines. Given our experience and the wide range of options already available, we were initially skeptical when <strong><a href=\"https://docs.github.com/en/actions\">GitHub Actions</a></strong> were introduced as another mechanism to manage the build and integration workflow. But the opportunity for developers to start small and easily customize behavior means that GitHub Actions are moving toward the default category for smaller projects. It's hard to argue with the convenience of having the build tool integrated directly into the source code repository. An enthusiastic community has emerged around this feature and that means a wide range of user-contributed tools and workflows are available to get started. Tools vendors are also getting on board via the <a href=\"https://github.com/marketplace?type=actions\">GitHub Marketplace</a>. However, we still recommend you proceed with caution. Although code and <a href=\"/radar/tools/git\">Git</a> history can be exported into alternative hosts, a development workflow based on GitHub Actions can't. Also, use your best judgment to determine when a project is large or complex enough to warrant an independently supported pipeline tool. But for getting up and running quickly on smaller projects, it's worth considering GitHub Actions and the ecosystem that is growing around them.</p>"
      },
      {
          "name": "FastAPI",
          "ring": "Trial",
          "quadrant": "languages-and-frameworks",
          "isNew": "TRUE",
          "description": "<p>We're seeing more teams adopting Python as the preferred language to build solutions, not just for data science but for back-end services too. In these scenarios, we're having good experiences with <strong><a href=\"https://fastapi.tiangolo.com/\">FastAPI</a></strong> — a modern, fast (high-performance), web framework for building APIs with Python 3.6 or later. Additionally, this framework and its ecosystem include features such as API documentation using OpenAPI that allow our teams to focus on the business functionalities and quickly create REST APIs, which makes FastAPI a good alternative to existing solutions in this space.</p>"
      },
      {
          "name": "Webpack 5 Module Federation",
          "ring": "Assess",
          "quadrant": "languages-and-frameworks",
          "isNew": "TRUE",
          "description": "<p>The release of the <strong><a href=\"https://webpack.js.org/concepts/module-federation/\">Webpack 5 Module Federation</a></strong> feature has been highly anticipated by developers of <a href=\"/radar/techniques/micro-frontends\">micro frontend</a> architectures. The feature introduces a more standardized way to optimize how module dependencies and shared code are managed and loaded. Module federation allows for the specification of shared modules, which helps with the deduplication of dependencies across micro frontends by loading code used by multiple modules only once. It also lets you distinguish between local and remote modules, where the remote modules are not actually part of the build itself but loaded asynchronously. Compared to build-time dependencies like npm packages, this can significantly simplify the deployment of a module update with many downstream dependencies. Be aware, though, that this requires you to bundle all of your micro frontends with Webpack, as opposed to approaches such as <a href=\"/radar/techniques/import-maps-for-micro-frontends\">import maps</a>, which might eventually become part of the W3C standard.</p>"
      },
      {
          "name": "Storybook",
          "ring": "Adopt",
          "quadrant": "Tools",
          "isNew": "FALSE",
          "description": "<p><strong><a href=\"https://github.com/styleguidist/react-styleguidist\">React Styleguidist</a></strong> is a development environment for React components. It includes a dev server with hot reloading capabilities and generates an HTML style guide for sharing with teams. The style guide shows a live version of all components in one place with documentation and a list of their props. We've mentioned React Styleguidist as a <a href=\"https://www.thoughtworks.com/radar/tools/ui-dev-environments\">UI dev environment</a> before, and over time it has become our default choice among similar tools in this space.</p>"
      },
  ]
};
export default data;
