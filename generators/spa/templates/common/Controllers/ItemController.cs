using DotNetNuke.Common;
using DotNetNuke.Common.Utilities;
using DotNetNuke.Security;
using DotNetNuke.UI.Modules;
using DotNetNuke.Web.Api;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Web.Http;
using <%= fullNamespace %>.Components.BaseClasses;
using <%= fullNamespace %>.Data;
using <%= fullNamespace %>.ViewModels;

namespace <%= fullNamespace %>.Controllers
{
    [SupportedModules("<%= moduleName %>")]
    [DnnModuleAuthorize(AccessLevel = SecurityAccessLevel.View)]

    public class ItemController : ApiControllerBase
    {
        public ItemController() { }
        [HttpDelete]
        public HttpResponseMessage Delete(int itemId)
        {
            var item = DbCtx.Items.FirstOrDefault(i => i.ItemId == itemId);
            if (item != null)
            {
                DbCtx.Items.Remove(item);
                DbCtx.SaveChanges();
            }

            return Request.CreateResponse(System.Net.HttpStatusCode.NoContent);
        }

        [HttpGet]
        public HttpResponseMessage Get(int itemId)
        {
            var itemVm = new ItemViewModel(DbCtx.Items.FirstOrDefault(i => i.ItemId == itemId));

            return Request.CreateResponse(itemVm);
        }

        [HttpGet]
        public HttpResponseMessage GetList()
        {
            List<ItemViewModel> retval = new List<ItemViewModel>();
            List<Item> items;

            items = DbCtx.Items.Where(i => i.ModuleId == ActiveModule.ModuleID).ToList();
            items.ForEach(i => retval.Add(new ItemViewModel(i, Globals.IsEditMode())));

            return Request.CreateResponse(retval);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public HttpResponseMessage Save(ItemViewModel item)
        {
            if (item.Id > 0)
            {
                var t = Update(item);
                return Request.CreateResponse(System.Net.HttpStatusCode.NoContent);
            }
            else
            {
                var t = Create(item);
                return Request.CreateResponse(t.ItemId);
            }

        }

        private Item Create(ItemViewModel item)
        {
            Item t = new Item
            {
                ItemName = item.Name,
                ItemDescription = item.Description,
                AssignedUserId = item.AssignedUser,
                ModuleId = ActiveModule.ModuleID,
                CreatedByUserId = UserInfo.UserID,
                LastModifiedByUserId = UserInfo.UserID,
                CreatedOnDate = DateTime.UtcNow,
                LastModifiedOnDate = DateTime.UtcNow
            };
            DbCtx.Items.Add(t);
            DbCtx.SaveChanges();

            return t;
        }

        private Item Update(ItemViewModel item)
        {

            var t = DbCtx.Items.FirstOrDefault(i => i.ItemId == item.Id);
            if (t != null)
            {
                t.ItemName = item.Name;
                t.ItemDescription = item.Description;
                t.AssignedUserId = item.AssignedUser;
                t.LastModifiedByUserId = UserInfo.UserID;
                t.LastModifiedOnDate = DateTime.UtcNow;
            }
            DbCtx.SaveChanges();

            return t;
        }
    }
}
