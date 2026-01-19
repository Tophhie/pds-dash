<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

<script lang="ts">
  window.ZOHOIM=window.ZOHOIM||function(a,b){ZOHOIM[a]=b;};window.ZOHOIM.prefilledMessage="";(function(){var d=document;var s=d.createElement('script');s.type='text/javascript';s.nonce='7232560246';s.defer=true;s.src="https://im.zoho.eu/api/v1/public/channel/3cd7bfa34e04555089f0c7dbfe57ed64/widget";d.getElementsByTagName('head')[0].appendChild(s); })()

  import PostComponent from "./lib/PostComponent.svelte";
  import AccountComponent from "./lib/AccountComponent.svelte";
  import InfiniteLoading from "svelte-infinite-loading";
  import { getNextPosts, Post, getAllMetadataFromPds, fetchPostsForUser } from "./lib/pdsfetch";
  import { getContributors, getHeatmapData } from "./lib/tcapifetch"
  import { Config } from "../config";
  import { onMount } from "svelte";
  import type { ComAtprotoRepoListRecords } from "@atcute/client/lexicons";
  import Heatmap from "svelte5-heatmap";
  import ContributorsModal from "./lib/ContributorsModal.svelte";
  import DarkModeToggle from "./lib/DarkModeToggle.svelte";
  import { isDark } from './lib/theme';

  let showModal = false;
  
  let posts: Post[] = [];
  let postsLoaded = false;

  let heatmapData: Record<string, number> = {};
  let year = new Date().getFullYear();
  let accountsData: any[] = [];
  let accountsError: Error | null = null;
  let accountsLoaded = false;

  let contributors: any[] = [];

  let hue: number = 1;
  const cycleColors = async () => {
    while (true) {
      hue += 1;
      if (hue > 360) {
        hue = 0;
      }
      document.documentElement.style.setProperty("--primary-h", hue.toString());
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  };

  let clickCounter = 0;
  const carameldansenfusion = async () => {
    clickCounter++;
    if (clickCounter >= 10) {
      clickCounter = 0;
      cycleColors();
    }
  };

onMount(async () => {
  try {
    // Load critical data first
    accountsData = await getAllMetadataFromPds();
    accountsLoaded = true;
  } catch (error: unknown) {
    accountsError = error instanceof Error ? error : new Error(String(error));
  }

  getNextPosts()
    .then(initialPosts => {
      posts = [...posts, ...initialPosts];
      postsLoaded = true;
    })
    .catch(err => console.error("Error fetching posts:", err));

  getHeatmapData()
    .then(data => {
      heatmapData = data;
    })
    .catch(err => console.error("Error fetching heatmap data:", err));

  getContributors()
    .then(data => {
      contributors = data;
    })
    .catch(err => console.error("Error fetching contributors:", err));
});



  const onInfinite = ({
    detail: { loaded, complete },
  }: {
    detail: { loaded: () => void; complete: () => void };
  }) => {
    if (!postsLoaded) {
      console.warn("Infinite scroll triggered before initial posts loaded.");
      return;
    }

    getNextPosts().then((newPosts) => {
      if (newPosts.length > 0) {
        posts = [...posts, ...newPosts];
        loaded();
      } else {
        complete();
      }
    });
  };

</script>

<main>
  <div id="Content">
    {#if !accountsLoaded && !accountsError}
      <p>Loading...</p>
    {:else if accountsError}
      <p>Error: {accountsError.message}</p>
    {:else}
      <div id="Account">
        <div>

          <img
            src={
              $isDark
                ? "https://public-blob.tophhie.cloud/logos/tophhiecloud-white.png"
                : "https://public-blob.tophhie.cloud/logos/tophhiecloud-colour.png"
            }
            height="50"
            alt="Tophhie Social Logo"
            id="Logo"
            style="padding-top:15px;"
          />
          <h1 onclick={carameldansenfusion} id="Header">Tophhie Social</h1>
          <p>Home to {accountsData.length} accounts/repos 🎉</p>
        </div>
        <div class="button-group">
          <a href="https://signup.tophhie.social" class="call-to-action">Sign up now!</a>
          <a href="https://migrate.tophhie.social" class="call-to-action">Migrate your Bluesky account!</a>
          <a href="https://discord.gg/YD8sF8JsCJ" class="call-to-action">Join the Tophhie Cloud Discord server!</a>
          <a href="https://status.tophhie.social" class="call-to-action">Server Status</a>
        </div>
        <div id="accountsList">
          {#each accountsData as accountObject}
            {#if !accountObject.hiddenFromHomepage}
              <AccountComponent account={accountObject} />
            {/if}
          {/each}
        </div>
        <p class="disclaimer-footer">
          {@html Config.FOOTER_TEXT}
          <br />
          Thank you also to our <a href="/#" onclick={() => (showModal = true)}>contributors!</a>
        </p>
      </div>
    {/if}

    <div id="Feed">
      {#if heatmapData}
        <div id="postContainer" style="padding:20px;">
          <a style={window.innerWidth <= 768 ? "padding-bottom: 10px" : ""}>Tophhie Social Posts</a>
          <Heatmap data={heatmapData} {year} lday={false} lmonth={window.innerWidth >= 768} />
        </div>
      {/if}
      {#if accountsLoaded}
        <AccountComponent account={accountsData[accountsData.length - 1]} welcome />
      {/if}
      {#each posts as postObject}
        <PostComponent post={postObject as Post} />
      {/each}
      <InfiniteLoading on:infinite={onInfinite} distance={3000} />
    </div>
  </div>
  <ContributorsModal bind:showModal>
    {#snippet header()}
      <p id="Header" style="font-size:20px; padding: 10px;">
        Thank you to everyone who has contributed to the Tophhie Social dashboard!
      </p>
    {/snippet}

    <ul class="contributor-list">
      {#each contributors as contributor}
        <li>
          {#if contributor.avatar_url}
            <img
              alt="Avatar of {contributor.login}"
              src="{contributor.avatar_url}"
              id="avatar"
            />
          {/if}
          <p>{contributor.login} • {contributor.contributions} contributions</p>
          <a href="https://github.com/{contributor.login}"><i class="fa fa-brands fa-github" style="font-size: 20px"></i></a>
        </li>
      {/each}
    </ul>
  </ContributorsModal>

  <!-- Dark Mode Toggle -->
  <DarkModeToggle />
</main>

<style>
</style>
