<template>
  <div class="sidebar-header">
    <SidebarFilter />
    <SidebarSearch />
  </div>
</template>

<script>
export default {
  components: {
    SidebarSearch: () => import("@/components/Sidebar/SidebarSearch.vue"),
    SidebarFilter: () => import("@/components/Sidebar/SidebarFilter.vue")
  }
};
</script>

<style lang="scss" scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 8px;
  column-gap: 8px;
}
</style>
